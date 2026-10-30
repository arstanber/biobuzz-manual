// Framer code component: loads one language of the translated BIOBUZZ manual
// from the folder where dist/ is hosted and renders it straight into the page
// (no iframe, so height follows the content and #G204-style links work).
import { useEffect, useState } from "react"
import { addPropertyControls, ControlType } from "framer"

const LANGS = ["ru", "kk", "ky", "uz", "tr", "ro", "zh", "es", "pt-BR", "fr", "ar"]

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 */
export default function FtcManual({ baseUrl, lang }) {
    const [html, setHtml] = useState("")
    const [error, setError] = useState("")

    useEffect(() => {
        const base = baseUrl.replace(/\/?$/, "/")
        let alive = true
        setError("")
        Promise.all([
            fetch(`${base}${lang}/manual-${lang}.html`).then((r) => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`)
                return r.text()
            }),
            fetch(`${base}manual.css`).then((r) => (r.ok ? r.text() : "")),
        ])
            .then(([body, css]) => {
                if (!alive) return
                body = body.replaceAll('src="../images/', `src="${base}images/`)
                setHtml(`<style>${css}</style>${body}`)
            })
            .catch((e) => alive && setError(String(e)))
        return () => {
            alive = false
        }
    }, [baseUrl, lang])

    // open the page at #G204 / #sec-10-5-5 once the text is in place
    useEffect(() => {
        if (!html || !location.hash) return
        document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView()
    }, [html])

    if (error) return <div style={{ padding: 16 }}>Не удалось загрузить мануал: {error}</div>
    if (!html) return <div style={{ padding: 16 }}>Загрузка…</div>
    return <div style={{ width: "100%" }} dangerouslySetInnerHTML={{ __html: html }} />
}

addPropertyControls(FtcManual, {
    baseUrl: {
        type: ControlType.String,
        title: "Base URL",
        defaultValue: "https://YOUR-HOST/biobuzz/",
    },
    lang: {
        type: ControlType.Enum,
        title: "Language",
        options: LANGS,
        defaultValue: "ru",
    },
})
