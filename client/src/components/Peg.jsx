const Peg = ({ player, cx, cy, onClick}) => {
    let color = ""
    if(player == 0) {
        color = "blue"
    } else if(player == 1) {
        color =  "red"
    } else {
        color = "black"
    }

    return <circle cx={cx} cy={cy} r="6" fill={color} onClick={onClick}/>
}

export default Peg