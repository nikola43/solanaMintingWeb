import React from 'react'

const CountDownTimer = ({hoursMinSecs}) => {

    const {days = 0, hours = 0, minutes = 0, seconds = 60} = hoursMinSecs;
    const [[dys, hrs, mins, secs], setTime] = React.useState([days, hours, minutes, seconds]);


    const tick = () => {

        if (dys === 0 && hrs === 0 && mins === 0 && secs === 0)
            reset()
        else if (hrs === 0 && mins === 0 && secs === 0) {
            setTime([dys, 23, 59, 59]);
        } else if (mins === 0 && secs === 0) {
            setTime([dys, hrs - 1, 59, 59]);
        } else if (secs === 0) {
            setTime([dys, hrs, mins - 1, 59]);
        } else {
            setTime([dys, hrs, mins, secs - 1]);
        }
    };


    const reset = () => setTime([parseInt(days), parseInt(hours), parseInt(minutes), parseInt(seconds)]);


    React.useEffect(() => {
        const timerId = setInterval(() => tick(), 1000);
        return () => clearInterval(timerId);
    });


    return (
        <div>
            <div className="row">
                <div className="col-lg-2 col-sm-12 col-xs-12 timer mx-auto">
                    <div className="countHour">{`${dys.toFixed(0).toString().padStart(2, '0')}`}</div>
                    <p>Days</p>
                </div>
                <div className="col-lg-2 col-sm-12 col-xs-12 timer mx-auto">
                    <div className="countHour">{`${(3 % hrs).toString().padStart(2, '0')}`}</div>
                    <p>Hours</p>
                </div>
                <div className="col-lg-2 col-sm-12 col-xs-12 timer mx-auto">
                    <div className="countMin">{`${mins.toString().padStart(2, '0')}`}</div>
                    <p>Minutes</p>
                </div>
                <div className="col-lg-2 col-sm-12 col-xs-12 timer mx-auto">
                    <div className="countSec">{`${secs.toString().padStart(2, '0')}`}</div>
                    <p>Seconds</p>
                </div>
            </div>
        </div>
    );
}

export default CountDownTimer;