import React from 'react';
import classNames from "classnames";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register the required components with Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend);

export const ParetoChart = ({
    className,
    data,
    ...props 
}) => {
  if (!data || !data.labels || !data.datasets || data.labels.length === 0 || data.datasets.length === 0) {
    return <div>No data available</div>;
  }

  const values = data.datasets[0].data;

  // Sort values and labels in descending order
  const sortedIndices = [...values.keys()].sort((a, b) => values[b] - values[a]);
  const sortedValues = sortedIndices.map(i => values[i]);
  const sortedLabels = sortedIndices.map(i => data.labels[i]);

  // Calculate cumulative percentage
  const total = sortedValues.reduce((acc, val) => acc + val, 0);
  const cumulativeValues = sortedValues.reduce((acc, val, i) => {
    const cumulativeSum = acc[i - 1] ? acc[i - 1] + val : val;
    acc.push(cumulativeSum);
    return acc;
  }, []).map(val => (val / total) * 100);

  const paretoData = {
    labels: sortedLabels,
    datasets: [
      {
        type: 'bar',
        label: data.datasets[0].label,
        data: sortedValues,
        backgroundColor: data.datasets[0].backgroundColor,
        borderColor: data.datasets[0].borderColor,
        borderWidth: 1,
      },
      {
        type: 'line',
        label: 'Cumulative Percentage',
        data: cumulativeValues,
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 2,
        fill: false,
        yAxisID: 'y-axis-2',
      },
    ],
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
      },
      'y-axis-2': {
        type: 'linear',
        position: 'right',
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value + '%';
          }
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return (
      <Bar data={paretoData} options={options} className={classNames(className)} {...props}/>
  );
};

export default ParetoChart;
