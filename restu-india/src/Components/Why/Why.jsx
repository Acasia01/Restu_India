import './Why.css'

export default function Why(){
    return(
        <div className="section section-alt">
            <div className="section-title">Why Choose Resatu India?</div>
            <div className="section-sub">Quality products, reliable service, and pan-India reach</div>
            <div className="why-grid">
            <div className="why-card">
                <div className="why-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
                <div className="why-title">Certified Quality</div>
                <div className="why-desc">All products manufactured with high-grade materials meeting hospital and healthcare standards.</div>
            </div>
            <div className="why-card">
                <div className="why-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                </div>
                <div className="why-title">Pan India Delivery</div>
                <div className="why-desc">We supply across India from our facility in Nangli Vihar, New Delhi South West.</div>
            </div>
            <div className="why-card">
                <div className="why-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
                <div className="why-title">Competitive Pricing</div>
                <div className="why-desc">Direct manufacturer pricing with no middlemen — best value for hospitals and clinics.</div>
            </div>
            <div className="why-card">
                <div className="why-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                </div>
                <div className="why-title">Complete Range</div>
                <div className="why-desc">From ICU beds to wheelchairs — everything a hospital needs under one roof.</div>
            </div>
            <div className="why-card">
                <div className="why-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                </div>
                <div className="why-title">Custom Orders</div>
                <div className="why-desc">Special requirements? We accept custom orders tailored to your hospital's specifications.</div>
            </div>
            </div>
        </div>
    );
}