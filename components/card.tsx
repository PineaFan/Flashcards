import Styles from '../styles/components/card.module.css';
import React from 'react'
import { withRouter } from "next/router";
import handleViewport, { InjectedViewportProps, useInViewport } from 'react-in-viewport';


export function ButtonFunction(value: string | (() => void)) {
    if (typeof value === "string") {
        return () => window.open(value, "_blank");
    }
    return value;
}

type ValidColours = "red" | "green" | "blue" | "yellow" | "purple" | "cyan" | "orange" | "grey" | "black" | "pink";
const colours: Record<ValidColours, {gradient: [string, string] | string, wave: string}> = {
    red: {gradient: ["F27878", "D96B6B"], wave: "hooky"},
    green: {gradient: ["60B258", "60B258"], wave: "gerrit"},
    blue: {gradient: ["775EBF", "4B5899"], wave: "gps"},
    yellow: {gradient: ["E5DC71", "E5DC71"], wave: "pypi"},
    purple: {gradient: ["A358B2", "8D58B2"], wave: "clicksforms"},
    cyan: {gradient: ["78F2F2", "78F2F2"], wave: "clcks"},
    orange: {gradient: ["E5AB71", "D9906B"], wave: "hooky"},
    grey: {gradient: ["C4C4C4", "C4C4C4"], wave: "github"},
    black: {gradient: ["000000", "242424"], wave: "nucleus"},
    pink: {gradient: ["F278C8", "F278C8"], wave: "rsm"}  // TODO
}


export function Card(props: React.PropsWithChildren<{
    title: string,
    description: string,
    colour: ValidColours,
    buttons?: {text: string, colour?: string, textColour?: string, newTab?: boolean, url: string}[],
    dashed?: string,
    icon?: string,
    roundIcon?: boolean,
    descriptionIsWarning?: undefined | "danger" | "warning",

    visible?: boolean
}>) {
    // If "border" is true, then [title, description, buttons] will be required
    // Otherwise, [title, description, icon, buttons, gradient, wave] will be required
    const title = <>{props.title}</>

    const { gradient, wave } = colours[props.colour || "red" ]

    const panel = <div
        className={Styles.panel}
        style={props.dashed ? {backgroundColor: "transparent"} : undefined}
    >
        <div className={Styles.titleContainer}>
            { props.icon ? <img
                src={props.icon}
                height="32"
                style={{borderRadius: props.roundIcon ? "100vw" : undefined}}
            /> : null }
            <p className={Styles.title}>{props.title}</p>
        </div>
        <div
            className={Styles.description}
            style={{backgroundColor: props.descriptionIsWarning ? {danger: "#F27878", warning: "#E5DC71"}[props.descriptionIsWarning] : undefined}}
        >
            {props.description}
        </div>
        <div className={Styles.buttonRow} style={props.dashed ? {justifyContent: "center"} : undefined}>
            {
                props.buttons?.map((button, index) => {
                    return <button
                        key={index}
                        onClick={ButtonFunction(button.url)}
                        style={{
                            backgroundColor: `#${button.colour || "424242"}`,
                            color: `#${button.textColour || "FFFFFF"}`
                        }}
                        className={Styles.button}
                    >
                        {button.text}
                    </button>
                })
            }
        </div>
    </div>

    return <div
        className={ Styles.card + " " + (props.visible ? Styles.shown : null)}
        style={props.dashed ? {border: `8px dashed #${props.dashed}`, boxSizing: "border-box", boxShadow: "none"} : undefined}
    >
        {
            !props.dashed ? <><div className={Styles.backgroundGradient} style={{
                backgroundImage: `linear-gradient(45deg, #${gradient[0]} 0%, #${gradient[1]} 100%)`
            }} />
            <img alt="" className={Styles.backgroundImage} src={`https://assets.clicks.codes/web/waves/card/${wave}.svg`} draggable={false} /></> : null
        }
        { panel }
        { (props.visible) ? <div className={Styles.shine} /> : null }
    </div>
}

// CardRow is a component that is simply blue when offscreen and red when onscreen
export function CardRow(props: React.PropsWithChildren<{}>) {
    // If children isn't an array, make it an array
    const children = React.Children.toArray(props.children);
    // And remove any elements that aren't react elements
    children.filter((child) => React.isValidElement(child)) as React.ReactElement[];

    // Define some states
    const [visibleIndex, setVisibleIndex] = React.useState(0);
    const [animating, setAnimating] = React.useState(false);

    // Create a ref for detecting when the screen is scrolled to the element
    const ref = React.useRef(null);
    const { inViewport } = useInViewport(ref, {}, {}, {});

    const max_time = 2500;
    const delay = Math.min(100, max_time / children.length);

    // When it becomes visible, begin the animation
    React.useEffect(() => {
        if (inViewport && !animating) {
            setAnimating(true);
            // Repeatedly increment the visible index until it is equal to the number of children
            const interval = setInterval(() => {
                setVisibleIndex((index) => {
                    if (index < children.length) { return index + 1; }
                    clearInterval(interval);
                    return index;
                });
            }, delay);
        }
    }, [inViewport]);

    return (
        <div className={Styles.cardRow} ref={ref}>
            {
                children.map((child, index) => {
                    child = child as React.ReactElement;
                    // If the child is visible, set it to be visible
                    const visible = index < visibleIndex;
                    return <Card {...child.props} visible={visible} key={index}/>
                })
            }
        </div>
    )
}
