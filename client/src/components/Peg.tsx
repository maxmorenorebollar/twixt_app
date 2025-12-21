interface PegProps {
  player: number | undefined;
  cx: number;
  cy: number;
  onClick: React.MouseEventHandler<SVGCircleElement>;
  validMove: boolean;
  handleMouseLeave: React.MouseEventHandler<SVGCircleElement>;
  handleMouseEnter: React.MouseEventHandler<SVGCircleElement>;
}

const Peg: React.FC<PegProps> = ({
  player,
  cx,
  cy,
  onClick,
  handleMouseEnter,
  validMove,
  handleMouseLeave,
}) => {
  const color = validMove
    ? "#facc15"
    : player === 0
    ? "#42a5f5"
    : player === 1
    ? "#ef4444"
    : "#94a3b8";

  return (
    <circle
      cx={cx}
      cy={cy}
      r={validMove ? 9 : 7}
      fill={color}
      stroke={validMove ? "#fde047" : "rgba(255,255,255,0.25)"}
      strokeWidth={validMove ? 2 : 1}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    />
  );
};

export default Peg;
