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

const IconHeart = () => (
  <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
  </svg>
);

const IconOxygen = () => (
  <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
    <path d="M10.708 2.372a2.382 2.382 0 0 0 -.71 .686l-4.892 7.26c-1.981 3.314 -1.22 7.466 1.767 9.882c2.969 2.402 7.286 2.402 10.254 0c2.987 -2.416 3.748 -6.569 1.795 -9.836l-4.919 -7.306c-.722 -1.075 -2.192 -1.376 -3.295 -.686z" />
  </svg>
);

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
  const isUserAtEndRef = useRef(true);

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
  const chartWidth = Math.max(600, dataLength * 35); 

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      const isAtEnd = Math.abs(scrollWidth - clientWidth - scrollLeft) < 20;
      isUserAtEndRef.current = isAtEnd;
    }
  };

  useEffect(() => {
    if (scrollContainerRef.current) {
      const { scrollWidth, clientWidth } = scrollContainerRef.current;
      
      if (scrollWidth > clientWidth && isUserAtEndRef.current) {
        scrollContainerRef.current.scrollLeft = scrollWidth;
      }
    }
  }, [reversedData, chartWidth]);

  const chartData = useMemo(() => {
    if (dataLength === 0) return null;

    const labels = reversedData.map(d => {
      const date = new Date(d.fecha);
      return date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    });

    const heartRateData = reversedData.map(d => d.frecuencia);
    const oxygenData = reversedData.map(d => d.oxigeno);

    const bpmValues = heartRateData.filter(v => v != null && v > 0);
    const maxBpm = bpmValues.length > 0 ? Math.max(...bpmValues) : 120;
    const minBpm = bpmValues.length > 0 ? Math.min(...bpmValues) : 60;
    
    const Y_FALL = maxBpm + 15;           // Arriba del máximo BPM
    const Y_INACTIVITY = minBpm - 15;     // Abajo del mínimo BPM
    const Y_SENSOR = minBpm - 25;         // Más abajo aún

    // Posicionamiento de eventos como líneas horizontales
    const fallsData = reversedData.map(d => d.caida_detectada ? Y_FALL : null);
    const inactivityData = reversedData.map(d => d.inactividad_detectada ? Y_INACTIVITY : null);
    const noContactData = reversedData.map(d => d.contacto_cardiaco === false ? Y_SENSOR : null);

    // Guardamos los valores para usar en las escalas
    return {
      labels,
      yRanges: { maxBpm, minBpm, Y_FALL, Y_INACTIVITY, Y_SENSOR },
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
          pointHoverRadius: 5,
          borderWidth: 2,
          order: 3 
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
          pointHoverRadius: 5,
          borderWidth: 2,
          order: 4
        },
        // Eventos como líneas horizontales discontinuas
        {
            label: 'Caída detectada',
            data: fallsData,
            borderColor: '#9333ea',
            borderWidth: 4,
            borderDash: [10, 5],
            pointRadius: 6,
            pointBackgroundColor: '#9333ea',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            showLine: true,
            spanGaps: false,
            tension: 0,
            yAxisID: 'y',
            order: 1
        },
        {
            label: 'Inactividad',
            data: inactivityData,
            borderColor: '#d97706',
            borderWidth: 4,
            borderDash: [10, 5],
            pointRadius: 5,
            pointBackgroundColor: '#d97706',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            showLine: true,
            spanGaps: false,
            tension: 0,
            yAxisID: 'y',
            order: 2
        },
        {
            label: 'Sensor sin contacto',
            data: noContactData,
            borderColor: '#9ca3af',
            borderWidth: 4,
            borderDash: [10, 5],
            pointRadius: 5,
            pointBackgroundColor: '#9ca3af',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            showLine: true,
            spanGaps: false,
            tension: 0,
            yAxisID: 'y',
            order: 2
        }
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
      legend: { 
          display: false
      },
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
           },
           label: (context) => {
               // Para eventos (líneas discontinuas), solo mostrar el nombre
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
        grid: { display: false },
        ticks: { 
          maxRotation: 0, 
          autoSkip: true, 
          maxTicksLimit: 12,
          font: { size: 11 } 
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: { display: true, text: 'BPM', color: '#ef4444', font: { weight: 'bold', size: 12 } },
        min: chartData?.yRanges ? chartData.yRanges.Y_SENSOR - 5 : -5,
        max: chartData?.yRanges ? chartData.yRanges.Y_FALL + 10 : 160,
        ticks: {
            stepSize: 20,
            font: { size: 11 },
            callback: function(value) {
              // Ocultamos los ticks de las líneas de eventos
              if (chartData?.yRanges) {
                const { Y_FALL, Y_INACTIVITY, Y_SENSOR } = chartData.yRanges;
                if (Math.abs(value - Y_FALL) < 5 || 
                    Math.abs(value - Y_INACTIVITY) < 5 || 
                    Math.abs(value - Y_SENSOR) < 5) {
                  return '';
                }
              }
              return value;
            }
        },
        grid: { 
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: { display: true, text: '% SpO₂', color: '#3b82f6', font: { weight: 'bold', size: 12 } },
        grid: { drawOnChartArea: false },
        min: 0,
        max: 100,
        ticks: {
          font: { size: 11 }
        }
      },
    },
  };

  if (!chartData) {
    return <div className="h-full w-full flex items-center justify-center text-gray-400 text-sm">Esperando datos...</div>;
  }

  return (
    <div className="w-full space-y-3">
      <div className="flex flex-wrap gap-4 justify-center items-center bg-gray-50 py-3 px-4 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2 px-2">
          <IconHeart />
          <span className="text-red-600 font-bold text-sm">Frecuencia (bpm)</span>
        </div>
        <div className="flex items-center gap-2 px-2 border-r border-gray-300 pr-6 mr-2">
          <IconOxygen />
          <span className="text-blue-600 font-bold text-sm">Oxígeno (%)</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-purple-600" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
            <path d="M11 21l1 -5l-1 -4l-3 -4h4l3 -3 M6 16l-1 -4l3 -4 M6 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0 M13.5 12h2.5l4 2"/>
          </svg>
          <div className="w-10 h-0 border-t-2 border-dashed border-purple-600"></div>
          <span className="text-gray-800 font-medium text-sm">Caída</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-amber-600" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
            <path d="M7 9m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0 M22 17v-3h-20 M2 8v9 M12 14h10v-2a3 3 0 0 0 -3 -3h-7v5z"/>
          </svg>
          <div className="w-10 h-0 border-t-2 border-dashed border-amber-600"></div>
          <span className="text-gray-800 font-medium text-sm">Inactividad</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
          </svg>
          <div className="w-10 h-0 border-t-2 border-dashed border-gray-500"></div>
          <span className="text-gray-800 font-medium text-sm">Sensor sin contacto</span>
        </div>
      </div>

      {/* Gráfica */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll} 
        className="w-full h-[350px] overflow-x-auto bg-white rounded-lg border border-gray-100 p-2 shadow-inner custom-scrollbar"
      >
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
    </div>
  );
}