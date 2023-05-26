/** allows you to use states in component */
import { useState } from "react"; 

function TestButton() {
    /** 
     * count: current state
     * setCount: function that lets you update it
     * either can have any name
     * initial value is the parameter of useState
     * each render of the same component gets it own state
     */
    const [count, setCount] = useState(0);
    
    /**
     * handler function is used to respond to events inside component
     * make sure to not use parentheses --> passing it down, not callinng
     */
    function handleClick() {
        /** count is 1 behind what I expected, like it updates after the alert */
        setCount(count + 1)
        alert('You\'ve clicked me ' + count + ' too many times!');
    }

    return (
        <button onClick={handleClick}>I'm a button<br />with {count} clicks</button>
    );
}

export default TestButton;