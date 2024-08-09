import React from "react";
import classNames from "classnames";
import { Pie, Doughnut, PolarArea, Bar, Line, Radar } from "react-chartjs-2";
import { Chart as ChartJS, RadialLinearScale, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement} from "chart.js";
import { ParetoChart as Pareto } from "../Plugins/ParetoChart.js";

// Register the required components with Chart.js
ChartJS.register(RadialLinearScale, ArcElement, Tooltip, Legend);

export const ProportionalChart = ({
    className,
    model = "pie",
    label = "Proportional Chart", 
    data = [],
    categories = [],
    sortMode = "quantity",
    order = "ascending",
    backgroundColor = [
        'rgba(204, 79, 106, 0.6)',
        'rgba(43, 130, 188, 0.6)',
        'rgba(204, 165, 69, 0.6)',
        'rgba(60, 154, 154, 0.6)',
        'rgba(122, 82, 204, 0.6)',
        'rgba(204, 127, 51, 0.6)',
        'rgba(159, 159, 159, 0.6)',
        'rgba(66, 82, 204, 0.6)',
        'rgba(204, 79, 204, 0.6)',
        'rgba(79, 204, 106, 0.6)',
        'rgba(204, 165, 106, 0.6)',
        'rgba(154, 60, 154, 0.6)',
        'rgba(82, 122, 204, 0.6)',
        'rgba(204, 127, 154, 0.6)',
        'rgba(106, 204, 79, 0.6)',
        'rgba(204, 106, 165, 0.6)',
        'rgba(154, 154, 60, 0.6)',
        'rgba(204, 82, 122, 0.6)',
        'rgba(204, 51, 127, 0.6)',
        'rgba(79, 106, 204, 0.6)',
        'rgba(165, 204, 106, 0.6)',
        'rgba(154, 60, 204, 0.6)',
        'rgba(204, 122, 82, 0.6)',
        'rgba(127, 204, 51, 0.6)',
        'rgba(204, 106, 204, 0.6)',
        'rgba(79, 204, 154, 0.6)',
        'rgba(165, 106, 204, 0.6)',
        'rgba(154, 60, 106, 0.6)',
        'rgba(204, 122, 204, 0.6)',
        'rgba(127, 51, 204, 0.6)',
    ],
    borderColor = [
        'rgba(153, 59, 80, 1)',
        'rgba(32, 98, 141, 1)',
        'rgba(153, 124, 52, 1)',
        'rgba(45, 116, 116, 1)',
        'rgba(92, 62, 153, 1)',
        'rgba(153, 95, 38, 1)',
        'rgba(119, 119, 119, 1)',
        'rgba(50, 62, 153, 1)',
        'rgba(153, 59, 153, 1)',
        'rgba(59, 153, 80, 1)',
        'rgba(153, 124, 80, 1)',
        'rgba(116, 45, 116, 1)',
        'rgba(62, 92, 153, 1)',
        'rgba(153, 95, 116, 1)',
        'rgba(80, 153, 59, 1)',
        'rgba(153, 80, 124, 1)',
        'rgba(116, 116, 45, 1)',
        'rgba(153, 62, 92, 1)',
        'rgba(153, 38, 95, 1)',
        'rgba(59, 80, 153, 1)',
        'rgba(124, 153, 80, 1)',
        'rgba(116, 45, 153, 1)',
        'rgba(153, 92, 62, 1)',
        'rgba(95, 153, 38, 1)',
        'rgba(153, 80, 153, 1)',
        'rgba(59, 153, 116, 1)',
        'rgba(124, 80, 153, 1)',
        'rgba(116, 45, 80, 1)',
        'rgba(153, 92, 153, 1)',
        'rgba(95, 38, 153, 1)',
    ],       
    top = 0,
    borderWidth = 1,
    ...props
}) => {
    const valueCounts = data.reduce((acc, item) => {
        let keys = [];
        for (let category of categories) {
            keys.push(item[category]);
        }
        let keysJSON = JSON.stringify(keys).replace(/^\[|\]$/g, '');
        
        if (!(String(keysJSON) === "null")) {
            acc[keysJSON] = (acc[keysJSON] || 0) + 1;
        }

        return acc;
    }, {});
    
    if (top <= 0) top = Object.keys(valueCounts).length;

    let sortedUniqueValues = Object.keys(valueCounts);

    if (sortMode == "quantity") {
        sortedUniqueValues = Object.keys(valueCounts).sort((x, y) => valueCounts[x] - valueCounts[y]);
    }
    if (sortMode == "label") {
        sortedUniqueValues = Object.keys(valueCounts).sort((x, y) => x <= y ? -1 : 1);
    }
    (order == "descending") && sortedUniqueValues.reverse()

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
        { model.toLowerCase() == "pie" && (
            <Pie className={classNames(className)} {...props} data={description}/>
        )}
        { model.toLowerCase() == "doughnut" && (
            <Doughnut className={classNames(className)} {...props} data={description}/>
        )}
        { model.toLowerCase() == "polar area" && (
            <PolarArea className={classNames(className)} {...props} data={description}/>
        )}
        { model.toLowerCase() == "pareto" && (
            <Pareto className={classNames(className)} {...props} data={description}/>
        )}
        { model.toLowerCase() == "bar" && (
            <Bar className={classNames(className)} {...props} data={description}/>
        )}
        { model.toLowerCase() == "line" && (
            <Line className={classNames(className)} {...props} data={description}/>
        )}
        { model.toLowerCase() == "radar" && (
            <Radar className={classNames(className)} {...props} data={description}/>
        )}
        </>
    )
}

export default ProportionalChart;





