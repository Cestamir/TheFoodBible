import React, { useState } from 'react'

interface ScrapeProps{
    sourceName: string;
    cooldown: number;
    onScraperRun: () => void;
}

const ScraperButton = ({sourceName,cooldown,onScraperRun} : ScrapeProps) => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    function canRunScraper(source: string) {
        const lastRun = localStorage.getItem(`scraperLastRun`);
        if (!lastRun) return true;
        const diff = Date.now() - parseInt(lastRun, 10);
        return diff > 60 * 60 * 1000; 
    }


    async function runScraper(source : string){
        setLoading(true);
        if (!canRunScraper(source)) {
            setMessage(`⏳ You can run scrapers again in ${Math.ceil(cooldown / 1000 / 60)} min.`);
            return;
        }
        try{
            const res = await fetch(`/api/scrape/${source}`, { method: "POST",headers: {
    "Content-Type": "application/json"},}); 
            const data = await res.json();
            if (data.ok) {
                onScraperRun();
                localStorage.setItem(`scraperLastRun`, Date.now().toString());
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
        <button className='btn' onClick={() => runScraper(sourceName)} disabled={loading || cooldown > 0}>{sourceName}</button>
        <p>{loading ? "loading data from scraper" : null}</p>
        <p>{cooldown > 0 && !loading ? `You can run scrapers again in ${Math.ceil(cooldown / 1000 / 60)} minutes` : message}</p>
    </div>
  )
}

export default ScraperButton;

