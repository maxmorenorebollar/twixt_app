interface LinkProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

const Link: React.FC<LinkProps> = ({ x1, y1, x2, y2 }) => {
  return (
    <line
      x1={`${x1}`}
      y1={`${y1}`}
      x2={`${x2}`}
      y2={`${y2}`}
      stroke="black"
      strokeWidth="2"
      vectorEffect="non-scaling-stroke"
    />
  );
};

export default Link;
