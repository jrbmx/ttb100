import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../auth/AuthContext';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend 
} from 'recharts';
import { 
  LayoutDashboard, Users, HeartPulse, Activity, LogOut, Search, Trash2, ShieldCheck, AlertTriangle, Eye
} from 'lucide-react';

const API = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export default function AdminDashboard() {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Estado para navegación interna (Tabs)
  const [activeTab, setActiveTab] = useState('overview'); // overview, users, patients, alerts

  // Estados de datos
  const [kpi, setKpi] = useState({ totalCuidadores: 0, totalPacientes: 0, totalAlertas: 0, pacientesConDispositivo: 0 });
  const [chartData, setChartData] = useState([]);
  const [chartTipos, setChartTipos] = useState([]);
  
  const [usersList, setUsersList] = useState([]);
  const [patientsList, setPatientsList] = useState([]);
  const [alertsList, setAlertsList] = useState([]);
  
  const [loading, setLoading] = useState(true);

  // Carga inicial
  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) return navigate('/auth');
      
      const headers = { "Authorization": `Bearer ${token}` };

      // 1. Cargar Dashboard General
      const resDash = await fetch(`${API}/api/admin/dashboard-data`, { headers });
      if (resDash.ok) {
        const data = await resDash.json();
        setKpi(data.kpi);
        setChartData(data.chartAlertas);
        setChartTipos(data.chartTipos);
      }

      // 2. Cargar Listas (Podríamos cargarlas lazy, pero las cargamos todas por simplicidad)
      const [resUsers, resPatients, resAlerts] = await Promise.all([
        fetch(`${API}/api/admin/users`, { headers }),
        fetch(`${API}/api/admin/patients`, { headers }),
        fetch(`${API}/api/admin/alerts`, { headers })
      ]);

      if (resUsers.ok) setUsersList(await resUsers.json());
      if (resPatients.ok) setPatientsList(await resPatients.json());
      if (resAlerts.ok) setAlertsList(await resAlerts.json());

    } catch (error) {
      console.error("Error admin:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDeleteUser = async (id, nombre) => {
    if(!window.confirm(`⚠️ ¡PELIGRO!\nVas a eliminar a ${nombre} y TODOS sus datos.\n¿Confirmar?`)) return;
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const res = await fetch(`${API}/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        alert("Eliminado.");
        fetchData(); 
      }
    } catch(e) { alert("Error de red"); }
  };

  const handleLogout = () => { logout(); navigate("/auth"); };

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-900 text-white">Cargando Sistema...</div>;

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-2xl z-20">
        <div className="p-6 border-b border-slate-800">
            <h1 className="text-2xl font-bold text-white tracking-wider">Over<span className="text-teal-400">vak</span></h1>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">Admin Console</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
            <SidebarItem icon={<LayoutDashboard size={20}/>} label="Panel General" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
            <SidebarItem icon={<Users size={20}/>} label="Usuarios" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
            <SidebarItem icon={<HeartPulse size={20}/>} label="Pacientes" active={activeTab === 'patients'} onClick={() => setActiveTab('patients')} />
            <SidebarItem icon={<AlertTriangle size={20}/>} label="Alertas Globales" active={activeTab === 'alerts'} onClick={() => setActiveTab('alerts')} />
        </nav>

        <div className="p-4 border-t border-slate-800">
            <div className="flex items-center gap-3 mb-4 px-2">
                <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold">A</div>
                <div className="overflow-hidden">
                    <p className="text-sm font-medium text-white truncate">{user.nombre}</p>
                    <p className="text-xs text-slate-500">Administrador</p>
                </div>
            </div>
            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors text-sm font-medium">
                <LogOut size={16} /> Cerrar Sesión
            </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 overflow-y-auto bg-gray-50 p-8">
        
        {/* VISTA: OVERVIEW */}
        {activeTab === 'overview' && (
            <div className="animate-fade-in space-y-8">
                <header>
                    <h2 className="text-3xl font-bold text-slate-800">Resumen del Sistema</h2>
                    <p className="text-slate-500">Métricas clave en tiempo real</p>
                </header>

                {/* KPI CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <KpiCard title="Cuidadores" value={kpi.totalCuidadores} icon={<Users className="text-blue-500" />} color="border-l-4 border-blue-500" />
                    <KpiCard title="Pacientes" value={kpi.totalPacientes} icon={<HeartPulse className="text-teal-500" />} color="border-l-4 border-teal-500" />
                    <KpiCard title="Dispositivos Activos" value={kpi.pacientesConDispositivo} icon={<Activity className="text-indigo-500" />} color="border-l-4 border-indigo-500" />
                    <KpiCard title="Total Alertas" value={kpi.totalAlertas} icon={<AlertTriangle className="text-orange-500" />} color="border-l-4 border-orange-500" />
                </div>

                {/* GRÁFICOS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-700 mb-4">Evolución de Alertas (7 días)</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                    <XAxis dataKey="_id" tick={{fontSize: 12}} stroke="#999" />
                                    <YAxis tick={{fontSize: 12}} stroke="#999" />
                                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                                    <Line type="monotone" dataKey="count" stroke="#F59E0B" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-700 mb-4">Tipos de Incidentes</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartTipos}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="_id" tick={{fontSize: 12}} />
                                    <YAxis />
                                    <RechartsTooltip />
                                    <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* VISTA: USUARIOS */}
        {activeTab === 'users' && (
            <TableLayout title="Gestión de Cuidadores" subtitle="Administra el acceso al sistema">
                 <DataTable 
                    columns={['Nombre', 'Email', 'Rol', 'Verificado', 'Acciones']}
                    data={usersList}
                    renderRow={(user) => (
                        <tr key={user._id} className="hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors">
                            <td className="p-4 font-medium text-gray-900">{user.nombre} {user.apellidoP}</td>
                            <td className="p-4 text-gray-600">{user.email}</td>
                            <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold ${user.rol === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>{user.rol}</span></td>
                            <td className="p-4">{user.verificado ? <ShieldCheck size={18} className="text-green-500"/> : <span className="text-red-400 text-xs">Pendiente</span>}</td>
                            <td className="p-4 text-right">
                                {user.rol !== 'admin' && (
                                    <button onClick={() => handleDeleteUser(user._id, user.nombre)} className="text-red-500 hover:bg-red-50 p-2 rounded-full transition"><Trash2 size={18}/></button>
                                )}
                            </td>
                        </tr>
                    )}
                 />
            </TableLayout>
        )}

        {/* VISTA: PACIENTES */}
        {activeTab === 'patients' && (
            <TableLayout title="Directorio de Pacientes" subtitle="Acceso total a expedientes">
                 <DataTable 
                    // Agregamos columna 'Ver' al final
                    columns={['Paciente', 'Cuidador', 'Dispositivo', 'Ult. Actividad', 'Ver']}
                    data={patientsList}
                    renderRow={(pac) => (
                        <tr key={pac._id} className="hover:bg-gray-50 border-b border-gray-100 transition-colors">
                            <td className="p-4 font-medium text-gray-900">{pac.nombre} {pac.apellidoP}</td>
                            <td className="p-4 text-gray-600">{pac.cuidador?.email || <span className="text-red-400 italic">Sin asignar</span>}</td>
                            <td className="p-4"><span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded border border-gray-200">{pac.dispositivo_id || 'N/A'}</span></td>
                            <td className="p-4 text-sm text-gray-500">{new Date(pac.updatedAt || Date.now()).toLocaleDateString()}</td>
                            
                            {/* --- BOTÓN DE ACCIÓN --- */}
                            <td className="p-4 text-center">
                                <button 
                                    onClick={() => navigate(`/paciente/${pac._id}`)} 
                                    className="bg-blue-100 hover:bg-blue-200 text-blue-700 p-2 rounded-full transition shadow-sm"
                                    title="Ver panel del paciente"
                                >
                                    <Eye size={18} />
                                </button>
                            </td>
                        </tr>
                    )}
                 />
            </TableLayout>
        )}

        {/* VISTA: ALERTAS */}
        {activeTab === 'alerts' && (
            <TableLayout title="Registro de Incidentes" subtitle="Historial global de alertas">
                 <DataTable 
                    columns={['Fecha', 'Paciente', 'Tipo', 'Mensaje']}
                    data={alertsList}
                    renderRow={(alerta) => (
                        <tr key={alerta._id} className="hover:bg-gray-50 border-b border-gray-100 text-sm">
                            <td className="p-4 text-gray-500">{new Date(alerta.createdAt).toLocaleString()}</td>
                            <td className="p-4 font-medium">{alerta.paciente?.nombre || 'Desconocido'}</td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                                    alerta.tipo === 'caida' ? 'bg-red-100 text-red-700' : 
                                    alerta.tipo.includes('geocerca') ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                    {alerta.tipo}
                                </span>
                            </td>
                            <td className="p-4 text-gray-600">{alerta.mensaje}</td>
                        </tr>
                    )}
                 />
            </TableLayout>
        )}

      </main>
    </div>
  );
}

// --- SUBCOMPONENTES (Para mantener el código ordenado) ---

function SidebarItem({ icon, label, active, onClick }) {
    return (
        <button 
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                active 
                ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
        >
            {icon}
            <span className="font-medium text-sm">{label}</span>
        </button>
    );
}

function KpiCard({ title, value, icon, color }) {
    return (
        <div className={`bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow ${color}`}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</p>
                    <h3 className="text-3xl font-bold text-gray-800 mt-2">{value}</h3>
                </div>
                <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
            </div>
        </div>
    );
}

function TableLayout({ title, subtitle, children }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                    <p className="text-sm text-gray-500">{subtitle}</p>
                </div>
                {/* Aquí podríamos agregar un input de búsqueda global si quisiéramos */}
            </div>
            {children}
        </div>
    );
}

function DataTable({ columns, data, renderRow }) {
    const [searchTerm, setSearchTerm] = useState("");
    
    // Filtrado simple (busca en todos los campos convertidos a string)
    const filteredData = data.filter(item => 
        Object.values(item).some(val => 
            String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    return (
        <div>
            <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex items-center">
                <Search size={16} className="text-gray-400 mr-2" />
                <input 
                    type="text" 
                    placeholder="Buscar..." 
                    className="bg-transparent border-none focus:ring-0 text-sm w-full outline-none text-gray-600"
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 font-semibold border-b border-gray-100">
                            {columns.map((col, idx) => (
                                <th key={idx} className="p-4">{col}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {filteredData.length > 0 ? (
                            filteredData.map((item) => renderRow(item))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="p-8 text-center text-gray-400">
                                    No se encontraron resultados
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 text-xs text-gray-400 text-center">
                Mostrando {filteredData.length} registros
            </div>
        </div>
    );
}