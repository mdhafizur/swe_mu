import React, { useState, useEffect } from "react";
import { Button, Typography, FormControlLabel, Checkbox } from "@mui/material";
import Chart, { ChartData, ChartOptions, registerables } from "chart.js/auto";
import { Scatter } from "react-chartjs-2";

Chart.register(...registerables);

interface DataPoint {
  x: number;
  y: number;
  label: string;
}

interface ScatterWithEvent extends ChartData<"scatter"> {
  getElementAtEvent?: (elems: any) => void;
}

const DataVisualization: React.FC = () => {
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [selectedDataPoints, setSelectedDataPoints] = useState<number[]>([]);
  const [chartData, setChartData] = useState<any>(null);

  // Define chart options
  const chartOptions: ChartOptions<"scatter"> = {
    plugins: {
      title: { display: true, text: "Data Points & Decision Boundary" },
    },
    scales: {
      x: { title: { display: true, text: "X Coordinate" } },
      y: { title: { display: true, text: "Y Coordinate" } },
    },
  };

  useEffect(() => {
    if (dataPoints.length > 0) {
      const newChartData = generateChartData();
      setChartData(newChartData);
    }
  }, [dataPoints]);

  // Function to add a new random data point
  const handleAddDataPoint = () => {
    const newDataPoint: DataPoint = {
      x: Math.random() * 10 - 5,
      y: Math.random() * 10 - 5,
      label: predict(Math.random() * 10 - 5, Math.random() * 10 - 5),
    };
    setDataPoints([...dataPoints, newDataPoint]);
  };

  // Function to handle selection/unselection of data points
  const handleDataPointSelection = (index: number) => {
    const selectedIndex = selectedDataPoints.indexOf(index);
    let newSelected: number[] = [];

    if (selectedIndex === -1) {
      newSelected = [...selectedDataPoints, index];
    } else if (selectedIndex === 0) {
      newSelected = selectedDataPoints.slice(1);
    } else if (selectedIndex === selectedDataPoints.length - 1) {
      newSelected = selectedDataPoints.slice(0, -1);
    } else if (selectedIndex > 0) {
      newSelected = [
        ...selectedDataPoints.slice(0, selectedIndex),
        ...selectedDataPoints.slice(selectedIndex + 1),
      ];
    }

    setSelectedDataPoints(newSelected);
  };

  // Function to forget selected data points
  const handleForgetSelectedDataPoints = () => {
    const newDataPoints = dataPoints.filter(
      (_, index) => !selectedDataPoints.includes(index)
    );
    setDataPoints(newDataPoints);
    setSelectedDataPoints([]);
  };

  // Function to predict label based on coordinates
  const predict = (x: number, y: number) => {
    return x + y > 0 ? "Positive" : "Negative";
  };

  // Function to generate chart data from data points
  const generateChartData = () => {
    const labels: string[] = [];
    const positiveData: { x: number; y: number }[] = [];
    const negativeData: { x: number; y: number }[] = [];

    dataPoints.forEach((point, index) => {
      labels.push(`Point ${index}`);
      if (point.label === "Positive") {
        positiveData.push({ x: point.x, y: point.y });
      } else {
        negativeData.push({ x: point.x, y: point.y });
      }
    });

    const datasets = [
      {
        label: "Positive",
        data: positiveData,
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
      {
        label: "Negative",
        data: negativeData,
        backgroundColor: "rgba(255, 99, 132, 0.6)",
      },
    ];

    return { labels, datasets };
  };

  // Function to calculate model accuracy
  const calculateAccuracy = (dataPoints: DataPoint[]) => {
    const total = dataPoints.length;
    const correct = dataPoints.filter(
      (point) => predict(point.x, point.y) === point.label
    ).length;
    return (correct / total) * 100;
  };

  // Calculate accuracy before unlearning
  const accuracyBeforeUnlearning = calculateAccuracy(dataPoints);

  return (
    <div>
      <Typography variant="h5">Data Visualization</Typography>
      <Button
        variant="contained"
        onClick={handleAddDataPoint}
        style={{ marginBottom: "10px" }}
      >
        Add Data Point
      </Button>
      <Button
        variant="contained"
        onClick={handleForgetSelectedDataPoints}
        disabled={selectedDataPoints.length === 0}
        style={{ marginBottom: "10px", marginLeft: "10px" }}
      >
        Forget Selected Data Points
      </Button>
      {chartData && (
        <Scatter
          data={chartData}
          options={chartOptions}
          onGotPointerCapture={(elems: any) => {
            if (elems.length > 0) {
              const index = elems[0].index;
              handleDataPointSelection(index);
            }
          }}
        />
      )}
      <div>
        <Typography variant="h6">Selected Data Points:</Typography>
        <ul>
          {dataPoints.map((point, index) => (
            <li key={index}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedDataPoints.includes(index)}
                    onChange={() => handleDataPointSelection(index)}
                  />
                }
                label={`Point ${index} (${point.x.toFixed(
                  2
                )}, ${point.y.toFixed(2)}) - ${point.label}`}
              />
            </li>
          ))}
        </ul>
      </div>
      <Typography variant="body1">
        Accuracy before unlearning: {accuracyBeforeUnlearning.toFixed(2)}%
      </Typography>
    </div>
  );
};

export default DataVisualization;
