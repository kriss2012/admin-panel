import { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function QRCodeGenerator({ travel, compact = false }) {
    const qrRef = useRef(null);

    const qrValue = travel.travelId || travel.id || '';

    const downloadQR = () => {
        const svg = qrRef.current.querySelector('svg');
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const size = 600;
        canvas.width = size;
        canvas.height = size + 120;
        const ctx = canvas.getContext('2d');

        // White background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const img = new Image();
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
            ctx.drawImage(img, 0, 0, size, size);
            URL.revokeObjectURL(url);

            // Add text below QR
            ctx.fillStyle = '#0f172a';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(travel.name || 'Travel', size / 2, size + 44);

            ctx.font = '18px Arial';
            ctx.fillStyle = '#64748b';
            ctx.fillText(travel.route || 'Pachora → Jalgaon', size / 2, size + 72);

            ctx.font = '14px Arial';
            ctx.fillStyle = '#94a3b8';
            ctx.fillText(`Driver: ${travel.driverName || ''}`, size / 2, size + 100);

            const link = document.createElement('a');
            link.download = `QR_${(travel.name || 'travel').replace(/\s+/g, '_')}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        };
        img.src = url;
    };

    const printQR = () => {
        const printWindow = window.open('', '_blank');
        const svg = qrRef.current.querySelector('svg');
        const svgData = new XMLSerializer().serializeToString(svg);

        printWindow.document.write(`
      <html>
        <head><title>QR Code - ${travel.name}</title></head>
        <body style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;margin:0;font-family:Arial,sans-serif;background:#fff;">
          <div style="width:280px;height:280px;">${svgData}</div>
          <h2 style="margin:16px 0 4px;font-size:22px;">${travel.name || 'Travel'}</h2>
          <p style="margin:0;color:#666;font-size:16px;">${travel.route || 'Pachora → Jalgaon'}</p>
          <p style="margin:4px 0 0;color:#999;font-size:14px;">Driver: ${travel.driverName || ''}</p>
          <p style="margin:12px 0;padding:8px 16px;background:#f1f5f9;border-radius:6px;font-size:12px;color:#64748b;">
            ID: ${qrValue}
          </p>
          <script>window.onload=()=>{window.print();window.close();}<\/script>
        </body>
      </html>
    `);
        printWindow.document.close();
    };

    const qrSize = compact ? 200 : 260;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            {/* QR Code */}
            <div
                ref={qrRef}
                style={{
                    background: 'white',
                    padding: 16,
                    borderRadius: 12,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                }}
            >
                <QRCodeSVG
                    value={qrValue}
                    size={qrSize}
                    level="H"
                    includeMargin={true}
                    fgColor="#0f172a"
                    bgColor="#ffffff"
                />
            </div>

            {/* Travel info */}
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: compact ? 15 : 18 }}>{travel.name}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 3 }}>{travel.route}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 1 }}>Driver: {travel.driverName}</div>
                <div style={{
                    marginTop: 8,
                    padding: '4px 10px',
                    background: 'var(--bg-card2)',
                    borderRadius: 6,
                    fontSize: 11,
                    color: 'var(--text-muted)',
                    fontFamily: 'monospace',
                    wordBreak: 'break-all',
                }}>
                    {qrValue}
                </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-primary btn-sm" onClick={downloadQR}>⬇️ Download PNG</button>
                <button className="btn btn-secondary btn-sm" onClick={printQR}>🖨️ Print QR</button>
            </div>

            {!compact && (
                <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', maxWidth: 260 }}>
                    Give this QR code to the driver. They scan it in the app to go online instantly — no password needed.
                </p>
            )}
        </div>
    );
}
