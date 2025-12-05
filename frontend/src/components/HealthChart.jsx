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
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null;

    // Tomamos hasta 50 registros para la gráfica para ver más historia
    const reversedData = [...data].slice(0, 50).reverse();

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
          pointRadius: 2,
        },
        {
          label: 'Oxígeno (%)',
          data: oxygenData,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          yAxisID: 'y1',
          tension: 0.3,
          fill: true,
          pointRadius: 2,
        },
      ],
    };
  }, [data]);

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
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 8, font: { size: 10 } }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: { display: true, text: 'pulsaciones por minuto', color: '#ef4444', font: { weight: 'bold' } },
        // --- CORRECCIÓN AQUÍ ---
        // Usamos 'suggestedMin' en lugar de 'min'. 
        // Si los datos bajan de 40, la escala se adaptará automáticamente.
        suggestedMin: 40, 
        suggestedMax: 120,
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: { display: true, text: '% saturación de oxígeno en la sangre', color: '#3b82f6', font: { weight: 'bold' } },
        grid: { drawOnChartArea: false },
        // --- CORRECCIÓN AQUÍ ---
        // Si el oxígeno cae a 0 (sensor desconectado), la gráfica bajará hasta 0.
        suggestedMin: 80,
        max: 100, 
      },
    },
  };

  if (!chartData) {
    return <div className="h-full w-full flex items-center justify-center text-gray-400 text-sm">Esperando datos...</div>;
  }

  return (
    <div className="w-full h-[350px]">
      <Line options={options} data={chartData} />
    </div>
  );
}