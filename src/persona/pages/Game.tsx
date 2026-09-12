import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../../lib/supabaseClient';
import PersonaShell from '../components/PersonaShell';
import GameBoard from '../components/GameBoard';

export default function Game() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    const check = async () => {
      if (loading) return;
      if (!user) {
        navigate('/persona/auth', { replace: true });
        return;
      }
      if (!supabase) {
        setChecked(true);
        return;
      }
      const { data: profile } = await supabase.from('profiles').select('registration_completed').eq('id', user.id).single();
      if (!profile?.registration_completed) {
        navigate('/persona/register', { replace: true });
        return;
      }
      setRegistered(true);
      setChecked(true);
    };
    check();
  }, [user, loading, navigate]);

  if (loading || !checked) {
    return (
      <PersonaShell>
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        </div>
      </PersonaShell>
    );
  }

  return <PersonaShell>{registered && <GameBoard />}</PersonaShell>;
}
