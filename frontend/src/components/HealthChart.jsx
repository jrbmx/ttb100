import React, { useMemo, useRef, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function HealthChart({ data }) {
  const scrollContainerRef = useRef(null);
  const chartRef = useRef(null);

  // Preparamos datos
  const reversedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    const fullHistory = [...data].reverse();
    const MAX_POINTS = 200; 
    if (fullHistory.length > MAX_POINTS) {
        const step = Math.ceil(fullHistory.length / MAX_POINTS);
        return fullHistory.filter((_, index) => index % step === 0);
    }
    return fullHistory;
  }, [data]);

  const dataLength = reversedData.length;
  const chartWidth = Math.max(800, dataLength * 60); // Mayor ancho por punto

  // Auto-scroll a la derecha
  useEffect(() => {
    if (scrollContainerRef.current) {
      const { scrollWidth, clientWidth } = scrollContainerRef.current;
      if (scrollWidth > clientWidth) {
        scrollContainerRef.current.scrollLeft = scrollWidth;
      }
    }
  }, [reversedData, chartWidth]);

  // Calculamos escalas
  const scalesConfig = useMemo(() => {
    const maxBpm = Math.max(...reversedData.map(d => d.frecuencia || 0), 100);
    const minBpm = Math.min(...reversedData.map(d => d.frecuencia || 0), 60);
    
    return {
      yBpm: { min: Math.max(0, minBpm - 20), max: maxBpm + 20 },
      yOxy: { min: 80, max: 100 }
    };
  }, [reversedData]);

  // Preparamos valores fijos en el eje Y para cada tipo de evento
  const EVENT_Y_POSITIONS = useMemo(() => ({
    fall: scalesConfig.yBpm.max - 5,        // Cerca del tope
    inactivity: scalesConfig.yBpm.min + 15, // Cerca del fondo
    sensor: scalesConfig.yBpm.min + 5       // Más al fondo
  }), [scalesConfig]);

  // Datasets
  const chartData = useMemo(() => {
    if (dataLength === 0) return null;

    const labels = reversedData.map(d => {
      const date = new Date(d.fecha);
      return date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    });

    return {
      labels,
      datasets: [
        {
          label: 'Frecuencia (bpm)',
          data: reversedData.map(d => d.frecuencia),
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          yAxisID: 'y',
          tension: 0.3,
          fill: true,
          pointRadius: 3,
          borderWidth: 3
        },
        {
          label: 'Oxígeno (%)',
          data: reversedData.map(d => d.oxigeno),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          yAxisID: 'y1',
          tension: 0.3,
          fill: true,
          pointRadius: 3,
          borderWidth: 3
        },
        // Eventos como líneas horizontales discontinuas
        {
          label: 'Caída Detectada',
          data: reversedData.map(d => d.caida_detectada ? EVENT_Y_POSITIONS.fall : null),
          borderColor: '#dc2626',
          borderWidth: 4,
          borderDash: [10, 5],
          pointRadius: 0,
          yAxisID: 'y',
          spanGaps: false,
          tension: 0
        },
        {
          label: 'Inactividad',
          data: reversedData.map(d => d.inactividad_detectada ? EVENT_Y_POSITIONS.inactivity : null),
          borderColor: '#ca8a04',
          borderWidth: 4,
          borderDash: [10, 5],
          pointRadius: 0,
          yAxisID: 'y',
          spanGaps: false,
          tension: 0
        },
        {
          label: 'Sensor Desconectado',
          data: reversedData.map(d => d.contacto_cardiaco === false ? EVENT_Y_POSITIONS.sensor : null),
          borderColor: '#f97316',
          borderWidth: 4,
          borderDash: [10, 5],
          pointRadius: 0,
          yAxisID: 'y',
          spanGaps: false,
          tension: 0
        }
      ],
    };
  }, [reversedData, dataLength, EVENT_Y_POSITIONS]);

  if (!chartData) {
    return <div className="h-[350px] w-full flex items-center justify-center text-gray-400 text-sm">Cargando gráfica...</div>;
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { 
        position: 'top',
        labels: { 
          usePointStyle: true, 
          boxWidth: 10,
          padding: 20,
          font: { size: 13, weight: '500' }
        } 
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#111827',
        bodyColor: '#4b5563',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        padding: 12,
        callbacks: {
          title: (context) => {
            const d = new Date(reversedData[context[0].dataIndex].fecha);
            return d.toLocaleString('es-MX', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            });
          },
          label: (context) => {
            // Para los eventos, solo mostrar el nombre sin el valor
            if (context.dataset.borderDash) {
              return context.dataset.label;
            }
            return `${context.dataset.label}: ${context.raw}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { 
          display: true,
          color: 'rgba(0,0,0,0.05)'
        },
        ticks: { 
          maxRotation: 0, 
          autoSkip: true, 
          maxTicksLimit: 12,
          font: { size: 12 }
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        min: scalesConfig.yBpm.min,
        max: scalesConfig.yBpm.max,
        title: { 
          display: true, 
          text: 'BPM', 
          color: '#ef4444', 
          font: { weight: 'bold', size: 13 } 
        },
        grid: { 
          display: true,
          color: 'rgba(239, 68, 68, 0.1)',
          lineWidth: 1
        },
        ticks: {
          font: { size: 12 }
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        min: scalesConfig.yOxy.min,
        max: scalesConfig.yOxy.max,
        title: { 
          display: true, 
          text: '% SpO₂', 
          color: '#3b82f6', 
          font: { weight: 'bold', size: 13 } 
        },
        grid: { display: false },
        ticks: {
          font: { size: 12 }
        }
      }
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Leyenda de eventos mejorada con iconos */}
      <div className="flex gap-8 justify-center items-center bg-gray-50 py-3 px-6 rounded-lg border border-gray-200">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-red-600" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
            <path d="M11 21l1 -5l-1 -4l-3 -4h4l3 -3 M6 16l-1 -4l3 -4 M6 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0 M13.5 12h2.5l4 2"/>
          </svg>
          <div className="w-12 h-0 border-t-2 border-dashed border-red-600"></div>
          <span className="text-gray-800 font-medium text-sm">Caída</span>
        </div>
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-yellow-600" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
            <path d="M7 9m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0 M22 17v-3h-20 M2 8v9 M12 14h10v-2a3 3 0 0 0 -3 -3h-7v5z"/>
          </svg>
          <div className="w-12 h-0 border-t-2 border-dashed border-yellow-600"></div>
          <span className="text-gray-800 font-medium text-sm">Inactividad</span>
        </div>
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
          </svg>
          <div className="w-12 h-0 border-t-2 border-dashed border-orange-500"></div>
          <span className="text-gray-800 font-medium text-sm">Sensor Desc.</span>
        </div>
      </div>

      {/* Contenedor del gráfico */}
      <div className="relative w-full h-[450px] bg-white rounded-lg border border-gray-200 shadow-sm">
        <div 
          ref={scrollContainerRef}
          className="w-full h-full overflow-x-auto custom-scrollbar"
        >
          <div 
            style={{ width: `${chartWidth}px`, height: '100%', minWidth: '100%' }} 
            className="relative"
          >
            {/* Gráfico */}
            <Line ref={chartRef} options={options} data={chartData} />
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { 
          height: 10px; 
        }
        .custom-scrollbar::-webkit-scrollbar-track { 
          background: #f8fafc; 
          border-radius: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: #cbd5e1; 
          border-radius: 5px; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { 
          background: #94a3b8; 
        }
      `}</style>
    </div>
  );
}