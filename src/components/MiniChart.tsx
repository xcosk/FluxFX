interface MiniChartProps {
  positive?: boolean;
  width?: number;
  height?: number;
}

export default function MiniChart({
  positive = true,
  width = 80,
  height = 32,
}: MiniChartProps) {
  const color = positive ? "#00c470" : "#f22a36";
  const points = positive
    ? "0,28 10,24 20,26 30,18 40,20 50,12 60,14 70,6 80,8"
    : "0,8 10,12 20,10 30,18 40,16 50,24 60,22 70,28 80,26";

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        points={points}
      />
    </svg>
  );
}
