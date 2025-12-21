interface LinkProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color?: string;
}

const Link: React.FC<LinkProps> = ({ x1, y1, x2, y2, color = "#94a3b8" }) => {
  return (
    <line
      x1={`${x1}`}
      y1={`${y1}`}
      x2={`${x2}`}
      y2={`${y2}`}
      stroke={color}
      strokeWidth="3"
      vectorEffect="non-scaling-stroke"
      strokeLinecap="round"
    />
  );
};

export default Link;
