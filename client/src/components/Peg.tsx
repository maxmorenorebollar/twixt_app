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
    ? "yellow"
    : player === 0
    ? "blue"
    : player === 1
    ? "red"
    : "black";

  return (
    <circle
      cx={cx}
      cy={cy}
      r="6"
      fill={color}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    />
  );
};

export default Peg;
