import { Stack, StackProps, RemovalPolicy, CfnOutput, Duration } from 'aws-cdk-lib';
import { Bucket, BlockPublicAccess } from 'aws-cdk-lib/aws-s3';
import {
  Distribution,
  ViewerProtocolPolicy,
  AllowedMethods,
  CachePolicy,
  ResponseHeadersPolicy,
} from 'aws-cdk-lib/aws-cloudfront';
import { S3BucketOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';
import * as path from 'path';
import * as fs from 'fs';

export interface FrontendStackProps extends StackProps {
  /** Path to the built frontend (vite build output). Skipped if it doesn't exist yet. */
  distPath?: string;
}

/**
 * React/Vite -> S3 -> CloudFront (spec section 26/27). The bucket is private;
 * CloudFront reaches it only via Origin Access Control, so there is no public
 * S3 URL and no AWS credentials are ever shipped to the browser.
 */
export class FrontendStack extends Stack {
  public readonly distributionDomainName: string;

  constructor(scope: Construct, id: string, props: FrontendStackProps = {}) {
    super(scope, id, props);

    const siteBucket = new Bucket(this, 'SiteBucket', {
      bucketName: undefined, // let CDK generate a unique name
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      enforceSSL: true,
    });

    const distribution = new Distribution(this, 'SiteDistribution', {
      defaultRootObject: 'index.html',
      defaultBehavior: {
        origin: S3BucketOrigin.withOriginAccessControl(siteBucket),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: AllowedMethods.ALLOW_GET_HEAD,
        cachePolicy: CachePolicy.CACHING_OPTIMIZED,
        responseHeadersPolicy: ResponseHeadersPolicy.SECURITY_HEADERS,
      },
      // Client-side routing (react-router): unknown paths fall back to index.html.
      errorResponses: [
        { httpStatus: 403, responseHttpStatus: 200, responsePagePath: '/index.html', ttl: Duration.seconds(0) },
        { httpStatus: 404, responseHttpStatus: 200, responsePagePath: '/index.html', ttl: Duration.seconds(0) },
      ],
    });

    const distPath = props.distPath ?? path.join(__dirname, '..', '..', 'dist');
    if (fs.existsSync(distPath)) {
      new BucketDeployment(this, 'DeploySite', {
        sources: [Source.asset(distPath)],
        destinationBucket: siteBucket,
        distribution,
        distributionPaths: ['/*'],
      });
    } else {
      // First `cdk deploy` before `npm run build` has produced a dist/: the
      // bucket and distribution still stand up, just empty. Run `npm run
      // build` and redeploy to publish the app.
    }

    this.distributionDomainName = distribution.distributionDomainName;
    new CfnOutput(this, 'DistributionDomainName', { value: distribution.distributionDomainName });
    new CfnOutput(this, 'SiteBucketName', { value: siteBucket.bucketName });
  }
}
