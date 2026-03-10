import React, { useEffect, useMemo, useState, useRef } from 'react';
import axios from 'axios';
import { FaTimes, FaRobot } from 'react-icons/fa';

// Knowledge base for intelligent responses
const CATEGORIES_INFO = {
    'Engine Parts': {
        description: 'Core components that make your bike run',
        common: ['piston', 'cylinder', 'crankshaft', 'valves', 'gaskets'],
        issues: {
            'low power': 'Check piston rings, valves, or air filter',
            'noise': 'Inspect cylinder head, tappets, or timing chain',
            'overheating': 'Check coolant, radiator, or head gasket'
        }
    },
    'Brake System Parts': {
        description: 'Safety-critical braking components',
        common: ['brake pads', 'disc', 'brake fluid', 'master cylinder', 'caliper'],
        issues: {
            'squeaking': 'Replace brake pads or clean disc rotor',
            'weak braking': 'Check brake fluid level or bleed air from system',
            'grinding': 'Brake pads worn out, replace immediately'
        }
    },
    'Electrical & Electronics': {
        description: 'Electrical systems and components',
        common: ['cdi', 'coil', 'switches', 'wiring', 'horn'],
        issues: {
            'not starting': 'Check battery, starter relay, or CDI unit',
            'weak spark': 'Replace spark plug or ignition coil',
            'horn not working': 'Check horn relay or wiring connections'
        }
    },
    'Transmission & Clutch': {
        description: 'Power transmission and clutch system',
        common: ['clutch plates', 'clutch cable', 'sprocket', 'drive chain'],
        issues: {
            'slipping': 'Replace clutch plates or adjust cable',
            'hard shifting': 'Check transmission oil or clutch adjustment',
            'chain noise': 'Lubricate or replace drive chain'
        }
    },
    'Filters (Oil, Air, Fuel)': {
        description: 'Keep your engine clean and efficient',
        common: ['oil filter', 'air filter', 'fuel filter'],
        issues: {
            'poor mileage': 'Replace air filter and clean carburetor',
            'black smoke': 'Dirty air filter, replace immediately',
            'low power': 'Check and replace clogged filters'
        }
    },
    'Lubricants & Oils': {
        description: 'Essential fluids for smooth operation',
        common: ['engine oil', 'gear oil', 'fork oil', 'brake fluid'],
        issues: {
            'stiff gear': 'Change gear oil',
            'engine noise': 'Use correct grade engine oil',
            'suspension hard': 'Replace fork oil'
        }
    },
    'Battery & Charging System': {
        description: 'Power supply and charging',
        common: ['battery', 'voltage regulator', 'alternator', 'battery cables'],
        issues: {
            'not starting': 'Charge or replace battery',
            'dim lights': 'Check charging system or voltage regulator',
            'battery draining': 'Inspect for electrical short or weak alternator'
        }
    },
    'Tyres & Wheels': {
        description: 'Contact points with the road',
        common: ['front tyre', 'rear tyre', 'tube', 'rim', 'spokes'],
        issues: {
            'puncture': 'Replace tube or use tubeless sealant',
            'vibration': 'Check wheel balancing or spoke tension',
            'wear': 'Replace tyres if tread depth is low'
        }
    }
};

const BIKE_KNOWLEDGE = {
    maintenance: {
        'oil change': 'Change engine oil every 3000-4000 km. Use recommended grade (10W30 or 20W40).',
        'chain cleaning': 'Clean and lubricate chain every 500-700 km. Replace if stretched.',
        'spark plug': 'Replace spark plug every 8000-10000 km for optimal performance.',
        'air filter': 'Clean air filter every 3000 km, replace every 6000 km.',
        'brake pads': 'Check brake pads every 5000 km. Replace if thickness is less than 2mm.'
    },
    general: {
        'mileage': 'For better mileage: Keep tyres properly inflated, service engine regularly, avoid aggressive acceleration.',
        'service': 'Free service typically at 500-1000 km, then every 3000-4000 km or 3-4 months.',
        'warranty': 'Most parts have 6 months to 1 year warranty. Keep purchase bills safe.',
        'genuine parts': 'Always prefer genuine or OEM parts for critical components like brakes, engine parts.',
    }
};

const greetingMessages = [
    "👋 Hello! I'm your Auto Spares Expert Assistant!",
    "I can help you with:",
    "🔧 Finding the right spare parts\n🏍️ Bike maintenance advice\n⚙️ Troubleshooting issues\n💡 Part recommendations",
    "What would you like to know?"
];

const ChatBot = () => {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        { from: 'bot', text: greetingMessages[0] },
        { from: 'bot', text: greetingMessages[1] },
        { from: 'bot', text: greetingMessages[2] },
        { from: 'bot', text: greetingMessages[3] },
    ]);
    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoadingProducts(true);
                const { data } = await axios.get('/api/products');
                setProducts(Array.isArray(data) ? data : data?.products || []);
            } catch (error) {
                console.error('Failed to load products:', error);
                setProducts([]);
            } finally {
                setLoadingProducts(false);
            }
        };

        fetchProducts();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const normalizedProducts = useMemo(() => {
        return products.map((p) => ({
            ...p,
            _search: `${p.name || ''} ${p.category || ''} ${p.brand || ''} ${p.description || ''}`.toLowerCase(),
        }));
    }, [products]);

    const addMessage = (from, text) => {
        setMessages((prev) => [...prev, { from, text }]);
    };

    const getIntelligentResponse = (query) => {
        const lower = query.toLowerCase();
        
        // Check maintenance questions
        if (/oil change|change oil|engine oil|when.*oil/i.test(lower)) {
            return `⏰ **OIL CHANGE INFO:**\n${BIKE_KNOWLEDGE.maintenance['oil change']}\n\nWould you like to see our engine oil products?`;
        }
        
        if (/chain|chain cleaning|lubricate|drive chain/i.test(lower)) {
            return `⏰ **CHAIN MAINTENANCE:**\n${BIKE_KNOWLEDGE.maintenance['chain cleaning']}\n\nWe have chain oils and cleaners available!`;
        }
        
        if (/spark plug|spark|plugs|ignition/i.test(lower)) {
            return `⏰ **SPARK PLUG INFO:**\n${BIKE_KNOWLEDGE.maintenance['spark plug']}\n\nCheck our spark plugs collection!`;
        }
        
        if (/air filter|filters|engine filter/i.test(lower)) {
            return `⏰ **AIR FILTER INFO:**\n${BIKE_KNOWLEDGE.maintenance['air filter']}\n\nWe have quality air filters in stock!`;
        }
        
        if (/brake pads|brake pad|brakes|stopping/i.test(lower)) {
            return `⏰ **BRAKE PAD INFO:**\n${BIKE_KNOWLEDGE.maintenance['brake pads']}\n\nWe offer genuine brake pads with warranty!`;
        }
        
        // Check general knowledge
        if (/mileage|fuel efficiency|save fuel|improve mileage/i.test(lower)) {
            return `💡 **MILEAGE IMPROVEMENT:**\n${BIKE_KNOWLEDGE.general['mileage']}\n\nRegular maintenance helps! Need any parts?`;
        }
        
        if (/service|servicing|when.*service|service interval/i.test(lower)) {
            return `🔧 **SERVICE SCHEDULE:**\n${BIKE_KNOWLEDGE.general['service']}\n\nKeep your bike healthy with regular service!`;
        }
        
        if (/warranty|guarantee|warranty period/i.test(lower)) {
            return `📋 **WARRANTY INFO:**\n${BIKE_KNOWLEDGE.general['warranty']}\n\nAll our parts come with proper warranty!`;
        }
        
        if (/genuine|original|oem|authentic|quality/i.test(lower)) {
            return `✅ **GENUINE PARTS:**\n${BIKE_KNOWLEDGE.general['genuine parts']}\n\nWe only sell authentic and certified parts!`;
        }
        
        // Check for specific issues/problems
        const issuesMap = {
            'brake squeak': { issue: 'squeaking', category: 'Brake System Parts' },
            'brake grinding': { issue: 'grinding', category: 'Brake System Parts' },
            'weak brake': { issue: 'weak braking', category: 'Brake System Parts' },
            'low power': { issue: 'low power', category: 'Engine Parts' },
            'engine noise': { issue: 'noise', category: 'Engine Parts' },
            'engine overheat': { issue: 'overheating', category: 'Engine Parts' },
            'not starting': { issue: 'not starting', category: 'Electrical & Electronics' },
            'weak spark': { issue: 'weak spark', category: 'Electrical & Electronics' },
            'horn not work': { issue: 'horn not working', category: 'Electrical & Electronics' },
            'clutch slip': { issue: 'slipping', category: 'Transmission & Clutch' },
            'gear hard': { issue: 'hard shifting', category: 'Transmission & Clutch' },
            'chain noise': { issue: 'chain noise', category: 'Transmission & Clutch' },
            'poor mileage': { issue: 'poor mileage', category: 'Filters (Oil, Air, Fuel)' },
            'black smoke': { issue: 'black smoke', category: 'Filters (Oil, Air, Fuel)' },
            'battery drain': { issue: 'battery draining', category: 'Battery & Charging System' },
            'dim light': { issue: 'dim lights', category: 'Battery & Charging System' },
            'tyre puncture': { issue: 'puncture', category: 'Tyres & Wheels' },
            'vibration': { issue: 'vibration', category: 'Tyres & Wheels' },
            'tyre wear': { issue: 'wear', category: 'Tyres & Wheels' }
        };
        
        for (const [keyword, { issue, category }] of Object.entries(issuesMap)) {
            if (lower.includes(keyword)) {
                const solution = CATEGORIES_INFO[category]?.issues[issue];
                if (solution) {
                    return `🔧 **PROBLEM: ${issue.toUpperCase()}**\n\n💡 **Solution:** ${solution}\n\n📦 **Category:** ${category}\n\nLet me help you find the right parts!`;
                }
            }
        }
        
        return null;
    };

    const handleSend = () => {
        const trimmed = input.trim();
        if (!trimmed) return;

        addMessage('user', trimmed);
        setInput('');

        setTimeout(() => {
            const lower = trimmed.toLowerCase();
            
            // Greetings
            if (/hi|hello|hey|greetings|namaste|hola|wassup|whats up/i.test(lower)) {
                addMessage('bot', '👋 Hello! Welcome to Shree Selvanayagi Auto Spares!\n\nI can help you:\n• Find auto spare parts\n• Get maintenance advice\n• Troubleshoot bike problems\n• Get product recommendations\n\nWhat can I help you with today?');
                return;
            }

            // Thank you
            if (/thank|thanks|appreciate|awesome|great|perfect|helpful/i.test(lower)) {
                addMessage('bot', '🙏 You\'re welcome! Feel free to ask if you need anything else. I\'m here to help!');
                return;
            }

            // Help/info requests
            if (/help|what can you do|capabilities|how can|assistance|guide/i.test(lower)) {
                addMessage('bot', '🤖 Here\'s what I can do for you:\n\n🔧 **Find Parts:** Search by name, brand, or category\n🏍️ **Maintenance:** Oil change, chain, filters, spark plugs\n⚙️ **Troubleshoot:** Brake issues, starting problems, noise\n💡 **Recommend:** Suggest parts based on your needs\n📞 **Contact:** Get our phone number and address\n\nJust ask me anything!');
                return;
            }

            // Contact info
            if (/contact|phone|number|address|location|store|visit|call/i.test(lower)) {
                addMessage('bot', '📞 **CONTACT SHREE SELVANAYAGI AUTO SPARES:**\n\n📱 Phone: +91 97155 60530\n📧 Email: selvanayagischml@gmail.com\n📍 Address: 17, Kangeyam Road, Chennimalai, Erode, Tamil Nadu 638051\n\n⏰ **Hours:**\nMon-Sat: 8:00 AM - 9:00 PM\nSunday: 8:00 AM - 2:00 PM\n\nWe\'re here to serve you! 😊');
                return;
            }

            // Get intelligent response first (maintenance, issues, categories)
            const intelligentResponse = getIntelligentResponse(trimmed);
            if (intelligentResponse) {
                addMessage('bot', intelligentResponse);
                return;
            }

            if (loadingProducts) {
                addMessage('bot', '⏳ Loading products database. One moment please...');
                return;
            }

            if (!normalizedProducts.length) {
                addMessage('bot', '⚠️ Products are loading. Please wait a moment and try again.\n\nOr call us: 📞 +91 97155 60530');
                return;
            }

            // Product search
            const searchTerms = lower
                .replace(/search|find|need|looking|show|help|suggest|recommend|choose|buy|want|get|give me|tell me about|show me/gi, '')
                .trim()
                .split(/\s+/)
                .filter((t) => t.length > 2);

            let results = [];

            if (searchTerms.length === 0) {
                // Show popular items
                results = normalizedProducts.slice(0, 6);
                addMessage('bot', '🌟 **Popular Auto Spare Parts:**');
            } else {
                // Search with better matching
                results = normalizedProducts.filter((p) =>
                    searchTerms.some((t) => 
                        p._search.includes(t) || 
                        p.name.toLowerCase().includes(t) ||
                        (p.category && p.category.toLowerCase().includes(t))
                    )
                );
                
                // If no results, try partial matching
                if (results.length === 0) {
                    results = normalizedProducts.filter((p) =>
                        searchTerms.some((t) => 
                            p.name.toLowerCase().includes(t.slice(0, 3))
                        )
                    );
                }
            }

            if (results.length === 0) {
                addMessage('bot', '❌ Couldn\'t find that part in stock.\n\n**Popular searches:**\n• Brake pads\n• Oil filter\n• Air filter\n• Spark plug\n• Chain\n• Clutch plates\n\nOr call us at 📞 +91 97155 60530 for custom queries!');
                return;
            }

            // Show results with details
            const top = results.slice(0, 5);
            const list = top.map((p, i) => 
                `${i + 1}. **${p.name}**${p.brand ? ' (' + p.brand + ')' : ''}\n   Category: ${p.category || 'General'}\n   Price: ₹${p.price || 'Contact for price'}`
            ).join('\n\n');

            addMessage('bot', `✅ **Found ${results.length} Product${results.length !== 1 ? 's' : ''}**\n\n${list}`);
            
            if (results.length > 5) {
                addMessage('bot', `📦 +${results.length - 5} more available. Visit our Products page to see all!`);
            }
            
            addMessage('bot', 'Would you like to know more about any of these products? 😊');
        }, 300);
    };

    return (
        <div className={`chatbot ${open ? 'open' : ''}`}>
            {!open && (
                <button className="chatbot-toggle" onClick={() => setOpen(true)}>
                    <FaRobot style={{ marginRight: '0.5rem', fontSize: '1.2rem' }} />
                    AI Assistant
                </button>
            )}

            {open && (
                <div className="chatbot-panel">
                    <div className="chatbot-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FaRobot style={{ fontSize: '1.3rem' }} />
                            <div>
                                <strong>Auto Spares AI Expert</strong>
                                <div className="chatbot-subtitle">Your 24/7 spare parts consultant</div>
                            </div>
                        </div>
                        <button 
                            className="chatbot-close"
                            onClick={() => setOpen(false)}
                            aria-label="Close chat"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    <div className="chatbot-messages">
                        {messages.map((m, idx) => (
                            <div key={idx} className={`chatbot-message ${m.from}`}>
                                {m.text.split('\n').map((line, i) => (
                                    <div key={i}>{line || '\u00A0'}</div>
                                ))}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chatbot-input">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask anything about auto spares..."
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            autoFocus
                        />
                        <button onClick={handleSend} disabled={!input.trim()}>
                            Send
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatBot;
