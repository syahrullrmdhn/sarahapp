import React from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function OperationsReportPanel({ opsReport }) {
    const handleExportPDF = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('Operations Report', pageWidth / 2, 20, { align: 'center' });

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Ringkasan 7 hari terakhir untuk monitoring, helpdesk, ticketing, dan aksi EOS', pageWidth / 2, 28, { align: 'center' });

        doc.setFontSize(8);
        doc.text(`Generated: ${new Date().toLocaleString('id-ID')}`, pageWidth / 2, 34, { align: 'center' });

        let yPos = 45;

        const addSection = (title, data) => {
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }

            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(title, 14, yPos);
            yPos += 8;

            const total = Object.values(data || {}).reduce((acc, val) => acc + (Number(val) || 0), 0);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Total: ${total}`, 14, yPos);
            yPos += 5;

            const tableData = Object.entries(data || {}).map(([key, value]) => {
                const percent = total > 0 ? Math.round((Number(value) / total) * 100) : 0;
                return [
                    String(key).replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()),
                    String(value),
                    `${percent}%`
                ];
            });

            if (tableData.length > 0) {
                autoTable(doc, {
                    startY: yPos,
                    head: [['Category', 'Count', 'Percentage']],
                    body: tableData,
                    theme: 'grid',
                    headStyles: {
                        fillColor: [37, 99, 235],
                        textColor: 255,
                        fontSize: 9,
                        fontStyle: 'bold'
                    },
                    bodyStyles: {
                        fontSize: 9,
                        textColor: 50
                    },
                    styles: {
                        cellPadding: 3,
                        lineWidth: 0.1
                    },
                    columnStyles: {
                        0: { cellWidth: 'auto' },
                        1: { cellWidth: 30, halign: 'center' },
                        2: { cellWidth: 30, halign: 'center' }
                    }
                });
                yPos = doc.lastAutoTable.finalY + 10;
            } else {
                doc.setFontSize(9);
                doc.text('No data available', 14, yPos);
                yPos += 10;
            }

            yPos += 5;
        };

        addSection('Tickets by Priority', opsReport?.tickets_by_priority || {});
        addSection('Tickets by Status', opsReport?.tickets_by_status || {});
        addSection('Helpdesk Channels', opsReport?.helpdesk_channels || {});
        addSection('EOS Actions', opsReport?.eos_actions || {});

        doc.save(`operations-report-${new Date().toISOString().split('T')[0]}.pdf`);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-medium text-slate-900 dark:text-slate-100">Operations report</h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Ringkasan 7 hari terakhir untuk monitoring, helpdesk, ticketing, dan aksi EOS.</p>
                </div>
                <button
                    onClick={handleExportPDF}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-200"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export PDF
                </button>
            </div>

            <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <StatBlock title="By priority" payload={opsReport?.tickets_by_priority || {}} />
                <StatBlock title="By status" payload={opsReport?.tickets_by_status || {}} />
                <StatBlock title="Helpdesk channels" payload={opsReport?.helpdesk_channels || {}} />
                <StatBlock title="EOS actions" payload={opsReport?.eos_actions || {}} />
            </section>
        </div>
    );
}

function StatBlock({ title, payload }) {
    const total = Object.values(payload || {}).reduce((acc, val) => acc + (Number(val) || 0), 0);
    const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-indigo-500', 'bg-cyan-500'];

    return (
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</div>
                <div className="text-sm font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">{total} total</div>
            </div>

            {Object.keys(payload || {}).length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-sm text-slate-400">No data available</div>
            ) : (
                <div className="space-y-4 flex-1">
                    {Object.entries(payload).map(([key, value], idx) => {
                        const percent = total > 0 ? Math.round((Number(value) / total) * 100) : 0;
                        const barColor = colors[idx % colors.length];
                        return (
                            <div key={key}>
                                <div className="flex justify-between text-sm mb-1.5">
                                    <span className="font-medium text-slate-700 dark:text-slate-300 capitalize">{String(key).replace('_', ' ')}</span>
                                    <span className="text-slate-500 dark:text-slate-400">{value} <span className="text-xs opacity-60">({percent}%)</span></span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                                    <div className={`h-2.5 rounded-full ${barColor} transition-all duration-1000 ease-out`} style={{ width: `${percent}%` }}></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </article>
    );
}