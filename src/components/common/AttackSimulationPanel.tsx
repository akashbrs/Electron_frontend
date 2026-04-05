import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/attacks.css';

type AttackType = 'SQL Injection' | 'XSS' | 'Brute Force' | 'DDoS';

export default function AttackSimulationPanel() {
    const [isOpen, setIsOpen] = useState(false);
    const [type, setType] = useState<AttackType>('SQL Injection');
    const [payload, setPayload] = useState('');
    const [status, setStatus] = useState<string[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const navigate = useNavigate();
    const statusEndRef = useRef<HTMLDivElement>(null);

    const log = (msg: string) => {
        setStatus(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`].slice(-5));
    };

    const triggerAttack = async () => {
        if (isRunning) return;
        setIsRunning(true);
        setStatus([]);
        log(`Starting ${type} attack...`);

        try {
            switch (type) {
                case 'SQL Injection':
                    log(`Injected Payload: ${payload}`);
                    // Redirect to shop with the payload in search
                    navigate(`/shop?search=${encodeURIComponent(payload)}`);
                    log(`Redirected to search results.`);
                    break;

                case 'XSS':
                    log(`XSS Payload: ${payload}`);
                    log(`Rendering payload in UI...`);
                    // The payload is rendered in the Panel itself below
                    break;

                case 'Brute Force':
                    log(`Simulating Brute Force on /api/auth/login/`);
                    for (let i = 1; i <= 20; i++) {
                        log(`Attempt ${i}: password='${payload}${i}'`);
                        try {
                            // Using axios directly to avoid any global interceptors if preferred, 
                            // but standard api is also fine.
                            await axios.post('http://127.0.0.1:8000/api/auth/login/', {
                                email: 'admin@vulnerable.com',
                                password: `${payload}${i}`
                            });
                        } catch (e) {
                            // Expected failures
                        }
                        // Short delay to avoid browser lockup
                        await new Promise(r => setTimeout(r, 100));
                    }
                    log(`Attack complete (20 attempts).`);
                    break;

                case 'DDoS':
                    log(`Firing 100 rapid requests to /api/products/`);
                    const requests = Array.from({ length: 100 }).map((_, i) => 
                        axios.get('http://127.0.0.1:8000/api/products/')
                            .then(() => i % 20 === 0 && log(`Sent ${i} requests...`))
                            .catch(() => {})
                    );
                    await Promise.all(requests);
                    log(`DDoS Simulation Complete (100 requests).`);
                    break;
            }
        } catch (err) {
            log(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className="asp-container">
            <button className="asp-trigger" onClick={() => setIsOpen(!isOpen)} title="Attack Simulation Panel">
                🔥
            </button>

            {isOpen && (
                <div className="asp-panel">
                    <div className="asp-header">
                        <span className="asp-title">Security Lab</span>
                        <button className="asp-close" onClick={() => setIsOpen(false)}>×</button>
                    </div>

                    <div className="asp-group">
                        <label className="asp-label">Vulnerability Type</label>
                        <select 
                            className="asp-select" 
                            value={type} 
                            onChange={(e) => setType(e.target.value as AttackType)}
                        >
                            <option value="SQL Injection">SQL Injection</option>
                            <option value="XSS">XSS Injection</option>
                            <option value="Brute Force">Brute Force</option>
                            <option value="DDoS">DDoS Stress</option>
                        </select>
                    </div>

                    <div className="asp-group">
                        <label className="asp-label">
                            {type === 'Brute Force' ? 'Base Password' : 'Payload Input'}
                        </label>
                        <input 
                            className="asp-input"
                            value={payload}
                            onChange={(e) => setPayload(e.target.value)}
                            placeholder={
                                type === 'SQL Injection' ? "' OR 1=1 --" :
                                type === 'XSS' ? "<script>alert('XSS')</script>" :
                                "Type payload here..."
                            }
                        />
                    </div>

                    {type === 'XSS' && payload && (
                        <div className="asp-group">
                            <label className="asp-label">XSS Preview Area</label>
                            <div 
                                className="asp-xss-preview"
                                dangerouslySetInnerHTML={{ __html: payload }}
                            />
                        </div>
                    )}

                    <button 
                        className="asp-btn" 
                        onClick={triggerAttack}
                        disabled={isRunning}
                    >
                        {isRunning ? 'Executing...' : `Execute ${type}`}
                    </button>

                    {status.length > 0 && (
                        <div className="asp-group">
                            <label className="asp-label">Activity Log</label>
                            <div className="asp-status">
                                {status.map((s, i) => <div key={i}>{s}</div>)}
                                <div ref={statusEndRef} />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
