import React, { useEffect } from 'react';
import Styles from '../styles/components/colour.module.css';
import { useReward } from "react-rewards";
import Image from 'next/image';


const removeInvalidCharacters = (colour: string) => {
    return colour.toUpperCase().split("").filter((x) => "0123456789ABCDEF".includes(x)).join("")
}

const toValidColour = (colour: string) => {
    // Lower, and remove any characters that aren't A-Z0-9
    colour = removeInvalidCharacters(colour).substring(0, 6)
    if (colour.length === 0) return "000000"
    if (colour.length === 1) return colour.repeat(6)
    if (colour.length === 2) return colour.repeat(3)
    if (colour.length === 3) return colour.split("").map(x => x.repeat(2)).join("")
    if (colour.length === 6) return colour
    // And if it was 4-5 characters... just fill the rest with 0s
    return colour + "0".repeat(6 - colour.length)
}

const hexToRgb = (hex: string) => {
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)
    return {rgb: `(${r}, ${g}, ${b})`, rgbArray: [r, g, b]}
}
const rgbToInt = (rgb: number[]) => {
    return (rgb[0] * 65536 + rgb[1] * 256 + rgb[2]).toString()
}
const rgbToHsv = (rgb: number[]) => {
    const r = rgb[0] / 255
    const g = rgb[1] / 255
    const b = rgb[2] / 255
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const delta = max - min
    const v = max
    const s = max === 0 ? 0 : delta / max
    const h = max === min ? 0 : max === r ? (g - b) / delta + (g < b ? 6 : 0) : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4
    return `(${Math.round(h * 60)}, ${Math.round(s * 100)}, ${Math.round(v * 100)})`
}
const rgbToCmyk = (rgb: number[]) => {
    const r = rgb[0] / 255
    const g = rgb[1] / 255
    const b = rgb[2] / 255
    const k = 1 - Math.max(r, g, b)
    const c = (1 - r - k) / (1 - k) || 0
    const m = (1 - g - k) / (1 - k) || 0
    const y = (1 - b - k) / (1 - k) || 0
    return `(${Math.round(c * 100)}, ${Math.round(m * 100)}, ${Math.round(y * 100)}, ${Math.round(k * 100)})`
}
const hexToAlternativeFormats = (hex: string) => {
    const rgb = hexToRgb(hex)
    const hsv = rgbToHsv(rgb.rgbArray)
    const cmyk = rgbToCmyk(rgb.rgbArray)
    return {
        hex: "#" + hex,
        rgb: rgb.rgb,
        rgbInt: rgbToInt(rgb.rgbArray),
        hsv: hsv,
        cmyk: cmyk
    }
}

const calculateTextColor = (hex: string) => {
    const rgb = hexToRgb(hex).rgbArray
    const brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000
    return brightness > 125 ? "#000000" : "#FFFFFF"
}


function AlternativeDisplay(props: {
    permanent: string,
    variable: string,
    copyable: boolean,
    adaptiveText: React.CSSProperties
}) {
    const { reward, isAnimating } = useReward(`copied${props.variable}`, "confetti", {
        elementCount: 50,
        lifetime: 100,
        angle: 75,
        spread: 180,
        decay: 0.9,
        colors: ["#F27878", "#E5AB71", "#E5DC71", "#E5DC71", "#78ECF2", "#6576CC", "#8D58B2"]
    });
    const copy = () => {
        navigator.clipboard.writeText(props.variable)
        if (!isAnimating) reward()
    }
    // When hovering, add a box shadow in the text colour
    return <div className={Styles.alternative} style={props.adaptiveText} id={`copied${props.variable}`}
        onClick={props.copyable ? copy : undefined}
    >
        <p>{props.permanent}: </p>
        <p
            onMouseEnter={(e) => { e.currentTarget.style.opacity = props.copyable ? "0.5" : "1"}}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1" }}
        >{props.variable}</p>
    </div>
}

const alternativeNames = {hex: "HEX", rgb: "RGB", rgbInt: "RGB Int", hsv: "HSV", cmyk: "CMYK"}
const validFormats = Object.keys(alternativeNames) as (keyof typeof alternativeNames)[]
// Export this so that the page can use it
export { validFormats }

export default function ColourPage(props: React.PropsWithChildren<{
    // Let the page use its own state for the colour
    currentColour?: string,
    currentCompareColour?: string,
    primaryFormat?: keyof typeof alternativeNames | "hex"
}>) {
    const toSet = toValidColour(props.currentColour || "F27878")
    let colour: string, setColour: (colour: string) => void;
    [colour, setColour] = React.useState(toSet);

    const compareToSet = toValidColour(props.currentCompareColour || toSet)
    let compareColour: string, setCompareColour: (colour: string) => void;
    [compareColour, setCompareColour] = React.useState(compareToSet);

    const [compare, setCompare] = React.useState(props.currentCompareColour !== undefined)

    const [alternativeFormats, setAlternativeFormats] = React.useState(hexToAlternativeFormats(toSet))
    const [compareAlternativeFormats, setCompareAlternativeFormats] = React.useState(hexToAlternativeFormats(toSet))

    const [typedColour, setTypedColour] = React.useState(colour)
    const [compareTypedColour, setCompareTypedColour] = React.useState(compareColour)

    const [titleSet, setTitleSet] = React.useState(false)

    const updateTitleAndURL = (colour: string, compareColour: string | undefined) => {
        // Update the URL
        window.history.replaceState({}, "", `/${colour}` + (compareColour ? `-${compareColour}` : ""))
        // Set the window title
        window.document.title = `#${colour}` + (compareColour ? ` against #${compareColour}` : "") + " - Pinea Colours"
    }

    const updateColour = (newValue: string, comparing: boolean = false) => {
        // Remove the leading #, if there is one
        newValue = newValue.replace(/^#/, "")
        newValue = removeInvalidCharacters(newValue).substring(0, 6)
        const validated = toValidColour(newValue)
        // Just get the last 6 characters
        if (comparing) {
            setCompareTypedColour(newValue)
            setCompareAlternativeFormats(hexToAlternativeFormats(validated))
            setCompareColour(validated)
        } else {
            setTypedColour(newValue)
            setAlternativeFormats(hexToAlternativeFormats(validated))
            setColour(validated)
        }
        // Update the URL (States have not propagated yet, so we need to use the values passed in)
        if (!comparing) { updateTitleAndURL(validated, compare ? compareColour : undefined)
        } else { updateTitleAndURL(colour, validated) }
    }
    useEffect(() => {
        // On load, update the URL
        window.history.replaceState({}, "", `/${colour}` + (compare ? `-${compareColour}` : ""))
        // Set the window title
        if (!titleSet) {
            updateTitleAndURL(colour, compareColour)
            setTitleSet(true)
        }
    }, [colour])
    const textColour = calculateTextColor(colour)
    const adaptiveText = {color: textColour}
    const compareTextColour = calculateTextColor(compareColour)
    const compareAdaptiveText = {color: compareTextColour}

    const alternatives = Object.keys(alternativeFormats).map((key) => {
        const value = alternativeFormats[key as keyof typeof alternativeFormats]
        const name = alternativeNames[key as keyof typeof alternativeNames]
        return <AlternativeDisplay
            key={key}
            permanent={name}
            variable={value}
            copyable={true}
            adaptiveText={adaptiveText} />
    })
    const compareAlternatives = Object.keys(compareAlternativeFormats).map((key) => {
        const value = compareAlternativeFormats[key as keyof typeof compareAlternativeFormats]
        const name = alternativeNames[key as keyof typeof alternativeNames]
        return <AlternativeDisplay
            key={key}
            permanent={name}
            variable={value}
            copyable={true}
            adaptiveText={compareAdaptiveText} />
    }
    )

    return <div className={Styles.container}>

        <meta name="theme-color" content={"#" + colour} />
        <meta name="description" content={`#${colour} | RGB: ${alternativeFormats.rgb}`} />

        <div className={Styles.colour} style={{backgroundColor: "#" + colour, height: compare ? "50vh" : "100vh"}}>
            <input
                className={Styles.inputObject}
                type="text"
                value={"#" + typedColour}
                onChange={(e) => updateColour(e.target.value)}
                maxLength={7}
                spellCheck={false}
                aria-label='Colour input'
                style={adaptiveText}
            />
            <div className={Styles.alternatives}>{ alternatives }</div>
        </div>
        <div className={Styles.colour} style={{backgroundColor: "#" + compareColour, height: "100vh"}}>
            <input
                className={Styles.inputObject}
                type="text"
                value={"#" + compareTypedColour}
                onChange={(e) => updateColour(e.target.value, true)}
                maxLength={7}
                spellCheck={false}
                aria-label='Compare input'
                style={compareAdaptiveText}
            />
            <div className={Styles.alternatives}>{ compareAlternatives }</div>
        </div>
        <div className={Styles.footer}>
            <button className={Styles.footerIcon} onClick={() => setCompare(!compare)}>{compare ? "Hide" : "Show"} Compare</button>
            <a href="/" className={Styles.footerIcon}>About</a>
            <a href="https://pinea.dev" className={Styles.footerIcon}><Image src="/pinea.svg" width={32} height={30} alt="" />PineaFan</a>
        </div>
    </div>
}
