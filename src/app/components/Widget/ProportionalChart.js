import React from "react";
import classNames from "classnames";
import { Pie, Doughnut, PolarArea, Bar, Line, Radar } from "react-chartjs-2";
import { Chart as ChartJS, RadialLinearScale, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement} from "chart.js";
import { ParetoChart as Pareto } from "../Plugins/ParetoChart.js";

// Register the required components with Chart.js
ChartJS.register(RadialLinearScale, ArcElement, Tooltip, Legend);

export const ProportionalChart = ({
    className,
    type = "pie",
    label = "Proportional Chart", 
    data = [],
    categories = [],
    sortMode = "quantity",
    backgroundColor = [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(255, 159, 64, 0.2)',
        'rgba(199, 199, 199, 0.2)',
        'rgba(83, 102, 255, 0.2)',
        'rgba(255, 99, 255, 0.2)',
        'rgba(99, 255, 132, 0.2)',
        'rgba(255, 206, 132, 0.2)',
        'rgba(192, 75, 192, 0.2)',
        'rgba(102, 153, 255, 0.2)',
        'rgba(255, 159, 192, 0.2)',
        'rgba(132, 255, 99, 0.2)',
        'rgba(255, 132, 206, 0.2)',
        'rgba(192, 192, 75, 0.2)',
        'rgba(255, 102, 153, 0.2)',
        'rgba(255, 64, 159, 0.2)',
        'rgba(99, 132, 255, 0.2)',
        'rgba(206, 255, 132, 0.2)',
        'rgba(192, 75, 255, 0.2)',
        'rgba(255, 153, 102, 0.2)',
        'rgba(159, 255, 64, 0.2)',
        'rgba(255, 132, 255, 0.2)',
        'rgba(99, 255, 192, 0.2)',
        'rgba(206, 132, 255, 0.2)',
        'rgba(192, 75, 132, 0.2)',
        'rgba(255, 153, 255, 0.2)',
        'rgba(159, 64, 255, 0.2)',
    ],
    borderColor = [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)',
        'rgba(199, 199, 199, 1)',
        'rgba(83, 102, 255, 1)',
        'rgba(255, 99, 255, 1)',
        'rgba(99, 255, 132, 1)',
        'rgba(255, 206, 132, 1)',
        'rgba(192, 75, 192, 1)',
        'rgba(102, 153, 255, 1)',
        'rgba(255, 159, 192, 1)',
        'rgba(132, 255, 99, 1)',
        'rgba(255, 132, 206, 1)',
        'rgba(192, 192, 75, 1)',
        'rgba(255, 102, 153, 1)',
        'rgba(255, 64, 159, 1)',
        'rgba(99, 132, 255, 1)',
        'rgba(206, 255, 132, 1)',
        'rgba(192, 75, 255, 1)',
        'rgba(255, 153, 102, 1)',
        'rgba(159, 255, 64, 1)',
        'rgba(255, 132, 255, 1)',
        'rgba(99, 255, 192, 1)',
        'rgba(206, 132, 255, 1)',
        'rgba(192, 75, 132, 1)',
        'rgba(255, 153, 255, 1)',
        'rgba(159, 64, 255, 1)',
    ],      
    top = 5,
    borderWidth = 1,
    ...props
}) => {
    const valueCounts = data.reduce((acc, item) => {
        let keys = [];
        for (let category of categories) {
            keys.push(item[category]);
        }
        let keysJSON = JSON.stringify(keys).replace(/^\[|\]$/g, '');
        
        acc[keysJSON] = (acc[keysJSON] || 0) + 1;
        return acc;
    }, {});
    
    if (top <= 0) top = Object.keys(valueCounts).length;

    let sortedUniqueValues = Object.keys(valueCounts);

    if (sortMode = "quantity") {
        let sortedUniqueValues = Object.keys(valueCounts).sort((x, y) => valueCounts[x] - valueCounts[y]);
    }
    if (sortMode = "label") {
        let sortedUniqueValues = Object.keys(valueCounts).sort((x, y) => x <= y ? -1 : 1);
    }

    let sortedUniqueValuesCounts = sortedUniqueValues.map((value) => valueCounts[value] || 0);
    
    sortedUniqueValues.splice(top);
    
    let othersCount = sortedUniqueValuesCounts.splice(top).reduce((total, count) => {
        return total + count;
    }, 0);
    
    if (othersCount > 0) {
        sortedUniqueValues.push("others");
        sortedUniqueValuesCounts.push(othersCount);
    }

    backgroundColor = Array(Math.ceil(top / backgroundColor.length) + 1).fill(backgroundColor).flat().slice(0, top + 1);
    borderColor = Array(Math.ceil(top / borderColor.length) + 1).fill(borderColor).flat().slice(0, top + 1);

    const description = {
        labels: sortedUniqueValues,
        datasets: [{
            label,
            data: sortedUniqueValuesCounts,
            backgroundColor,
            borderColor,
            borderWidth
        }]
    }

    return (
        <>
        { type.toLowerCase() == "pie" && (
            <Pie className={classNames(className)} {...props} data={description}/>
        )}
        { type.toLowerCase() == "doughnut" && (
            <Doughnut className={classNames(className)} {...props} data={description}/>
        )}
        { type.toLowerCase() == "polar area" && (
            <PolarArea className={classNames(className)} {...props} data={description}/>
        )}
        { type.toLowerCase() == "pareto" && (
            <Pareto className={classNames(className)} {...props} data={description}/>
        )}
        { type.toLowerCase() == "bar" && (
            <Bar className={classNames(className)} {...props} data={description}/>
        )}
        { type.toLowerCase() == "line" && (
            <Line className={classNames(className)} {...props} data={description}/>
        )}
        { type.toLowerCase() == "radar" && (
            <Radar className={classNames(className)} {...props} data={description}/>
        )}
        </>
    )
}

export default ProportionalChart;





