const Peg = ({ player, cx, cy, onClick, handleMouseEnter, validMove, handleMouseLeave}) => {
    let color = ""
    if(player == 0) {
        color = "blue"
    } else if(player == 1) {
        color =  "red"
    } else {
        color = "black"
    }
    
    if(validMove) {
        color = "yellow"
    }

    return <circle cx={cx} cy={cy} r="6" fill={color} onClick={onClick} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}/>
}

export default Peg