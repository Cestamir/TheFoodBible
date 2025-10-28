import React, { useState } from 'react'

interface ScrapeProps{
    sourceName: string;
}

const ScraperButton = ({sourceName} : ScrapeProps) => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    function canRunScraper(source: string) {
        const lastRun = localStorage.getItem(`scraper_${source}_lastRun`);
        if (!lastRun) return true;
        const diff = Date.now() - parseInt(lastRun, 10);
        return diff > 60 * 60 * 1000; // 1 hour
    }


    async function runScraper(source : string){
        setLoading(true);
        if (!canRunScraper(source)) {
            setMessage(`⏳ You can run ${source} again in 1 hour.`);
            return;
        }
        try{
            const res = await fetch(`/api/scrape/${source}`, { method: "POST",headers: {
    "Content-Type": "application/json"},});
            const data = await res.json();
            if (data.ok) {
            localStorage.setItem(`scraper_${source}_lastRun`, Date.now().toString());
            setMessage(`✅ ${source} started successfully`);
            } else {
            setMessage(`❌ ${data.error}`);
            }
        } catch {
        setMessage("❌ Network error");
        } finally {
        setLoading(false);
        }
    }

  return (
    <div>
        <button onClick={() => runScraper(sourceName)}>{sourceName}</button>
        <p>{loading ? "loading data from scraper" : null}</p>
        <p>{message}</p>
    </div>
  )
}

export default ScraperButton;

