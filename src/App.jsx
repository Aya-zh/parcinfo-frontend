import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Materiels from './pages/Materiels';
import AjouterMateriel from './pages/AjouterMateriel';
import ModifierMateriel from './pages/ModifierMateriel';
import Affectations from './pages/Affectations';
import AjouterAffectation from './pages/AjouterAffectation';
import ModifierAffectation from './pages/ModifierAffectation';
import Register from './pages/Register';
import Utilisateurs from './pages/Utilisateurs';
import AjouterUtilisateur from './pages/AjouterUtilisateur';
import ModifierUtilisateur from './pages/ModifierUtilisateur';
import Pannes from './pages/Pannes';
import SignalerPanne from './pages/SignalerPanne';
import ModifierPanne from './pages/ModifierPanne';
function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={
            <PrivateRoute><Dashboard /></PrivateRoute>
          } />
          <Route path="/dashboard/technicien" element={
            <PrivateRoute><Dashboard /></PrivateRoute>
          } />
          <Route path="/dashboard/responsable" element={
            <PrivateRoute><Dashboard /></PrivateRoute>
          } />
          <Route path="/dashboard/beneficiaire" element={
            <PrivateRoute><Dashboard /></PrivateRoute>
          } />
          <Route path="/materiels" element={
            <PrivateRoute><Materiels /></PrivateRoute>
          } />
          <Route path="/materiels/ajouter" element={
            <PrivateRoute><AjouterMateriel /></PrivateRoute>
          } />
          <Route path="/materiels/modifier/:id" element={
            <PrivateRoute><ModifierMateriel /></PrivateRoute>
          } />
          <Route path="/affectations" element={
            <PrivateRoute><Affectations /></PrivateRoute>
          } />
          <Route path="/affectations/ajouter" element={
            <PrivateRoute><AjouterAffectation /></PrivateRoute>
          } />
          <Route path="/affectations/modifier/:id" element={<ModifierAffectation />} />
          <Route path="/register" element={<Register />} />
          <Route path="/utilisateurs" element={
             <PrivateRoute><Utilisateurs /></PrivateRoute>
             } />
             <Route path="/utilisateurs/ajouter" element={
             <PrivateRoute><AjouterUtilisateur /></PrivateRoute>
             } />
             <Route path="/utilisateurs/modifier/:id" element={
             <PrivateRoute><ModifierUtilisateur /></PrivateRoute>
             } />
             <Route path="/pannes" element={
             <PrivateRoute><Pannes /></PrivateRoute>
             } />
             <Route path="/pannes/ajouter" element={
             <PrivateRoute><SignalerPanne /></PrivateRoute>
             } />
             <Route path="/pannes/modifier/:id" element={
             <PrivateRoute><ModifierPanne /></PrivateRoute>
             } />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;