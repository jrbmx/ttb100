// src/components/HealthChart.jsx
import React, { useMemo } from 'react';
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
  const reversedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    const fullHistory = [...data].reverse();
    const MAX_POINTS = 150; 
    
    if (fullHistory.length > MAX_POINTS) {
        const step = Math.ceil(fullHistory.length / MAX_POINTS);
        
        return fullHistory.filter((_, index) => index % step === 0);
    }

    return fullHistory;
  }, [data]);

  const dataLength = reversedData.length;
  const chartWidth = Math.max(600, dataLength * 30); 

  const chartData = useMemo(() => {
    if (dataLength === 0) return null;

    const labels = reversedData.map(d => {
      const date = new Date(d.fecha);
      return date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    });

    const heartRateData = reversedData.map(d => d.frecuencia);
    const oxygenData = reversedData.map(d => d.oxigeno);

    return {
      labels,
      datasets: [
        {
          label: 'Frecuencia (bpm)',
          data: heartRateData,
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          yAxisID: 'y',
          tension: 0.3,
          fill: true,
          pointRadius: 3,
          pointHoverRadius: 6,
        },
        {
          label: 'Oxígeno (%)',
          data: oxygenData,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          yAxisID: 'y1',
          tension: 0.3,
          fill: true,
          pointRadius: 3,
          pointHoverRadius: 6,
        },
      ],
    };
  }, [reversedData, dataLength]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#111827',
        bodyColor: '#4b5563',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        titleFont: { size: 13, weight: 'bold' },
        bodyFont: { size: 12 },
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
           title: (context) => {
             const index = context[0].dataIndex;
             const datoOriginal = reversedData[index];
             if (!datoOriginal) return "";
             const d = new Date(datoOriginal.fecha);
             return d.toLocaleString('es-MX', { 
               weekday: 'long', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
             });
           }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { 
          maxRotation: 0, 
          autoSkip: true, 
          maxTicksLimit: 12, // Limitamos etiquetas en el eje X para limpieza visual
          font: { size: 10 } 
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: { display: true, text: 'BPM', color: '#ef4444', font: { weight: 'bold' } },
        suggestedMin: 40, 
        suggestedMax: 120,
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: { display: true, text: '% SpO2', color: '#3b82f6', font: { weight: 'bold' } },
        grid: { drawOnChartArea: false },
        suggestedMin: 80,
        max: 100, 
      },
    },
  };

  if (!chartData) {
    return <div className="h-full w-full flex items-center justify-center text-gray-400 text-sm">Esperando datos...</div>;
  }

  return (
    <div className="w-full h-[350px] overflow-x-auto bg-white rounded-lg border border-gray-100 p-2 shadow-inner custom-scrollbar">
      {/* El ancho se ajusta dinámicamente según los puntos filtrados */}
      <div style={{ width: `${chartWidth}px`, height: '100%', minWidth: '100%' }}>
        <Line options={options} data={chartData} />
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #a8a8a8; }
      `}</style>
    </div>
  );
}