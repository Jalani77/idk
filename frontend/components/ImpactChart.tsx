import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ImpactChart({ totals }: { totals: { totalROI: number, totalTimeSaved: number } }) {
  const data = {
    labels: ['Monthly ROI ($)', 'Time Saved (hrs)'],
    datasets: [
      {
        label: 'Impact',
        data: [totals.totalROI, totals.totalTimeSaved],
        backgroundColor: ['#4f46e5', '#22c55e']
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: false, text: 'Impact' }
    }
  };

  return (
    <div className="card">
      <Bar data={data} options={options} />
    </div>
  );
}
