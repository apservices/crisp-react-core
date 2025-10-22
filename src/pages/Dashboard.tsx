import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { email } = useAuth();

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Bem-vindo, {email}</h1>
      <p className="mb-4">Escolha uma opção:</p>
      <div className="space-y-2">
        <Link to="/studio" className="block bg-purple-600 text-white text-center p-3 rounded-xl hover:bg-purple-700">
          Estúdio de Mixagem
        </Link>
        <Link to="/tracks" className="block bg-teal-600 text-white text-center p-3 rounded-xl hover:bg-teal-700">
          Minhas Faixas
        </Link>
      </div>
    </div>
  );
}
