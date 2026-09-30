import React, { useState, useEffect } from 'react';
import api from '../api';
import './PatientChartGrid.css';
import { ChevronLeft, ChevronRight, Edit3, ChevronDown, ChevronUp, Activity } from 'lucide-react';
import VitalsModal from './VitalsModal';
import LabsModal from './LabsModal';
import ObsModal from './ObsModal';
import VolumesModal from './VolumesModal';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const PatientChartGrid = ({ isCritical, bedNo, patientId, hospital_id, ward_id, onToggleCritical, isUpdating, isNurseView }) => {
    // Determine time slots based on patient state
    const timeSlots = isCritical
        ? Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`)
        : ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'];

    const getLocalDateString = (dateObj) => {
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [currentDate, setCurrentDate] = useState(getLocalDateString(new Date()));
    const [chartData, setChartData] = useState({ vitals: [], labs: [], observations: [], volumes: [], urine: [] });
    const [loading, setLoading] = useState(true);
    const [isEditMode, setIsEditMode] = useState(false);
    const [showVolumeChart, setShowVolumeChart] = useState(true);

    // Modals state
    const [modalOpen, setModalOpen] = useState({ type: null, timeSlot: null, activeField: null }); // type: 'vitals', 'labs', 'obs', 'volumes'

    useEffect(() => {
        fetchChartData();
    }, [currentDate, bedNo]);

    const fetchChartData = async () => {
        setLoading(true);
        try {
            const endpoint = (hospital_id && ward_id)
                ? `/charts/staff/${hospital_id}/${ward_id}/${bedNo}?date=${currentDate}`
                : `/charts/ward/${bedNo}?date=${currentDate}`;
            const res = await api.get(endpoint);
            setChartData({ ...res.data.data, volumes: res.data.data.volumes || [], urine: res.data.data.urine || [] });
        } catch (err) {
            console.error('Failed to fetch chart data:', err);
            setChartData({ vitals: [], labs: [], observations: [], volumes: [], urine: [] });
        } finally {
            setLoading(false);
        }
    };

    const changeDate = (days) => {
        const d = new Date(currentDate);
        d.setDate(d.getDate() + days);
        setCurrentDate(getLocalDateString(d));
    };

    // Helper: Find and merge data matching a specific time slot
    const getRowData = (slot) => {
        const slotHour = parseInt(slot.split(':')[0], 10);
        // Critical is hourly (1 hour span), non-critical is 3-hourly (3 hour span)
        const nextSlotHour = isCritical ? slotHour + 1 : slotHour + 3;
        
        const mergeSlotData = (items) => {
            const slotItems = items.filter(item => {
                if (!item.chart_time) return false;
                const itemHour = parseInt(item.chart_time.split(':')[0], 10);
                return itemHour >= slotHour && itemHour < nextSlotHour;
            });
            
            if (slotItems.length === 0) return null;
            
            // This merges fields, keeping the last non-null value for each field in the time window
            return slotItems.reduce((acc, curr) => {
                const cleanCurr = Object.fromEntries(Object.entries(curr).filter(([_, v]) => v !== null && v !== undefined && v !== ''));
                return { ...acc, ...cleanCurr };
            }, {});
        };

        const vital = mergeSlotData(chartData.vitals);
        const lab = mergeSlotData(chartData.labs);
        const obs = mergeSlotData(chartData.observations);
        const volume = mergeSlotData(chartData.volumes);
        
        // --- NEW URINE LOGIC ---
        const getUrineForSlot = () => {
            const urineRecords = chartData.urine || [];
            let total = 0;
            let hasData = false;
            
            const numHours = isCritical ? 1 : 3;
            
            for (let i = 1; i <= numHours; i++) {
                let targetH = (slotHour + i) % 24;
                let targetHourStr = (targetH < 10 ? '0' : '') + targetH + ':00';
                
                const recordsForHour = urineRecords.filter(r => r.hour === targetHourStr);
                if (recordsForHour.length > 0) {
                    const maxVal = Math.max(...recordsForHour.map(r => r.urine_ml));
                    total += maxVal;
                    hasData = true;
                }
            }
            return hasData ? { urine_val: total } : null;
        };

        const urine = getUrineForSlot();

        return { vital, lab, obs, volume, urine };
    };

    const handleCellClick = (type, slot, field = null) => {
        if (!isEditMode) return;
        setModalOpen({ type, timeSlot: slot, activeField: field });
    };

    const handleModalClose = () => {
        setModalOpen({ type: null, timeSlot: null, activeField: null });
    };

    const handleSaveSuccess = () => {
        setModalOpen({ type: null, timeSlot: null, activeField: null });
        fetchChartData(); // Refresh the grid
    };

    const renderInvertedGrid = () => {
        // Build rows configuration
        const rowsConfig = [
            { label: 'Time', type: 'header', key: 'time' },
            { label: 'Urine (ml)', type: 'urine', key: 'urine_val' },
            { label: 'PCV %', type: 'labs', key: 'pcv_percentage' },
            { label: 'CRFT', type: 'vitals', key: 'crft' },
            { label: 'PR /min', type: 'vitals', key: 'pr_min' },
            { label: 'BP Supine (Sys/Dia)', type: 'vitals', key: 'bp_supine' },
            { label: 'Pulse Pressure', type: 'vitals', key: 'pulse_pressure' },
            { label: 'BP Sitting (Sys/Dia)', type: 'vitals', key: 'bp_sitting' },
            { label: 'RR /min', type: 'vitals', key: 'rr_min' },
            { label: 'Plt /mm³', type: 'labs', key: 'plt_count' },
            { label: 'WBC', type: 'labs', key: 'wbc_total' },
            { label: 'Observations', type: 'obs', key: 'observation_text' }
        ];

        const chartRenderData = timeSlots.map(slot => {
            const { volume } = getRowData(slot);
            return {
                time: slot,
                oral_ml: volume?.oral_ml || 0,
                n_saline_ml: volume?.n_saline_ml || 0,
                dextran_40_ml: volume?.dextran_40_ml || 0,
                tetrastarch_ml: volume?.tetrastarch_ml || 0,
                blood_ml: volume?.blood_ml || 0,
                other_ml: volume?.other_ml || 0,
            };
        });

        return (
            <div className="table-responsive inverted-table-container">
                <table className={`medical-table inverted-table ${isEditMode ? 'edit-mode-active' : ''}`}>
                    <tbody>
                        {showVolumeChart && (
                            <tr>
                                <th className="row-header-fixed" style={{ verticalAlign: 'middle', backgroundColor: '#f8fafc' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#64748b' }}>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Volume Input (ml)</span>
                                    </div>
                                </th>
                                <td colSpan={24} style={{ padding: 0, height: '180px', verticalAlign: 'bottom', borderBottom: 'none' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartRenderData} margin={{ top: 15, right: 0, left: 0, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={false} />
                                            <XAxis dataKey="time" hide={true} />
                                            <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'rgba(0,0,0,0.1) 0px 4px 12px' }} />
                                            <Bar dataKey="oral_ml" stackId="a" fill="#f87171" name="Oral" style={{ cursor: isEditMode ? 'pointer' : 'default' }} onClick={(data) => { if (isEditMode) handleCellClick('volumes', data.time, 'oral_ml'); }} />
                                            <Bar dataKey="n_saline_ml" stackId="a" fill="#60a5fa" name="N. Saline" style={{ cursor: isEditMode ? 'pointer' : 'default' }} onClick={(data) => { if (isEditMode) handleCellClick('volumes', data.time, 'n_saline_ml'); }} />
                                            <Bar dataKey="dextran_40_ml" stackId="a" fill="#facc15" name="40% Dextran" style={{ cursor: isEditMode ? 'pointer' : 'default' }} onClick={(data) => { if (isEditMode) handleCellClick('volumes', data.time, 'dextran_40_ml'); }} />
                                            <Bar dataKey="tetrastarch_ml" stackId="a" fill="#34d399" name="Tetrastarch" style={{ cursor: isEditMode ? 'pointer' : 'default' }} onClick={(data) => { if (isEditMode) handleCellClick('volumes', data.time, 'tetrastarch_ml'); }} />
                                            <Bar dataKey="blood_ml" stackId="a" fill="#dc2626" name="Blood" style={{ cursor: isEditMode ? 'pointer' : 'default' }} onClick={(data) => { if (isEditMode) handleCellClick('volumes', data.time, 'blood_ml'); }} />
                                            <Bar dataKey="other_ml" stackId="a" fill="#94a3b8" name="Other" style={{ cursor: isEditMode ? 'pointer' : 'default' }} onClick={(data) => { if (isEditMode) handleCellClick('volumes', data.time, 'other_ml'); }} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </td>
                            </tr>
                        )}

                        {rowsConfig.map((row, index) => (
                            <tr key={row.key} className={row.type === 'header' ? 'header-row' : ''}>
                                <th className="row-header-fixed">
                                    {row.label === 'Time' ? (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                            <span>{row.label}</span>
                                            <button
                                                className="btn-icon"
                                                onClick={() => setShowVolumeChart(!showVolumeChart)}
                                                style={{ padding: '0.2rem', minWidth: '24px', minHeight: '24px' }}
                                                title={showVolumeChart ? "Hide Graph" : "Show Graph"}
                                            >
                                                {showVolumeChart ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                            </button>
                                        </div>
                                    ) : (
                                        row.label
                                    )}
                                </th>
                                {timeSlots.map(slot => {
                                    if (row.type === 'header') {
                                        return (
                                            <th
                                                key={slot}
                                                className={`time-col-header ${isEditMode ? 'editable-time-header' : ''}`}
                                                onClick={() => { if (isEditMode) handleCellClick('volumes', slot, 'oral_ml'); }}
                                                style={isEditMode ? { cursor: 'pointer' } : {}}
                                                title={isEditMode ? "Click to add Volume" : ""}
                                            >
                                                {slot}
                                                {isEditMode && <div style={{ fontSize: '0.7rem', color: '#16a34a', marginTop: '4px', fontWeight: 600 }}>+ Vol</div>}
                                            </th>
                                        );
                                    }

                                    const data = getRowData(slot);
                                    let cellValue = '-';
                                    let isCellEmpty = true;

                                    if (row.type === 'vitals' && data.vital) {
                                        if (row.key === 'bp_supine') {
                                            if (data.vital.bp_supine_sys) {
                                                cellValue = `${data.vital.bp_supine_sys}/${data.vital.bp_supine_dia || '-'}`;
                                                isCellEmpty = false;
                                            }
                                        } else if (row.key === 'bp_sitting') {
                                            if (data.vital.bp_sitting_sys) {
                                                cellValue = `${data.vital.bp_sitting_sys}/${data.vital.bp_sitting_dia || '-'}`;
                                                isCellEmpty = false;
                                            }
                                        } else {
                                            cellValue = data.vital[row.key] || '-';
                                            if (data.vital[row.key]) isCellEmpty = false;
                                        }
                                    } else if (row.type === 'labs' && data.lab) {
                                        cellValue = data.lab[row.key] || '-';
                                        if (row.key === 'pcv_percentage' && data.lab.pcv_percentage) cellValue = `${data.lab.pcv_percentage}%`;
                                        if (data.lab[row.key]) isCellEmpty = false;
                                    } else if (row.type === 'obs' && data.obs) {
                                        cellValue = data.obs.observation_text || '-';
                                        if (data.obs.observation_text) isCellEmpty = false;
                                    } else if (row.type === 'volumes' && data.volume) {
                                        cellValue = data.volume[row.key] || '-';
                                        if (data.volume[row.key]) isCellEmpty = false;
                                    } else if (row.type === 'urine' && data.urine) {
                                        cellValue = data.urine[row.key] !== undefined ? data.urine[row.key] : '-';
                                        if (data.urine[row.key] !== undefined) isCellEmpty = false;
                                    }

                                    const isEditable = isEditMode && row.type !== 'header';

                                    return (
                                        <td
                                            key={`${row.key}-${slot}`}
                                            onClick={() => {
                                                if (row.type === 'urine') {
                                                    handleCellClick('vitals', slot, 'urine');
                                                } else {
                                                    handleCellClick(row.type, slot, row.key);
                                                }
                                            }}
                                            className={isEditable ? 'editable-cell' : ''}
                                        >
                                            {cellValue}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const renderStandardGrid = () => {
        return (
            <div className="table-responsive">
                <table className={`medical-table ${isEditMode ? 'edit-mode-active' : ''}`}>
                    <thead>
                        <tr>
                            <th rowSpan={2}>Time</th>
                            <th colSpan={6} className="section-vitals">Vitals (Click to Edit)</th>
                            <th colSpan={3} className="section-labs">Labs (Click to Edit)</th>
                            <th rowSpan={2} className="section-obs">Observations/Action</th>
                            <th rowSpan={2} className="section-urine" style={{ backgroundColor: '#fef9c3', color: '#854d0e' }}>Urine (ml)</th>
                        </tr>
                        <tr>
                            {/* Vitals */}
                            <th>PR /min</th>
                            <th>BP (Supine)</th>
                            <th>Pulse Pressure</th>
                            <th>BP (Sitting)</th>
                            <th>CRFT</th>
                            <th>RR /min</th>
                            {/* Labs */}
                            <th>PCV %</th>
                            <th>Plt /mm³</th>
                            <th>WBC</th>
                        </tr>
                    </thead>
                    <tbody>
                        {timeSlots.map(slot => {
                            const { vital, lab, obs, volume, urine } = getRowData(slot);
                            return (
                                <tr key={slot}>
                                    <td className="time-col">{slot}</td>

                                    {/* Vitals */}
                                    <td onClick={() => handleCellClick('vitals', slot, 'pr_min')} className={isEditMode && !vital?.pr_min ? 'editable-cell' : ''}>
                                        {vital?.pr_min || '-'}
                                    </td>
                                    <td onClick={() => handleCellClick('vitals', slot, 'bp_supine')} className={isEditMode && (!vital?.bp_supine_sys && !vital?.bp_supine_dia) ? 'editable-cell' : ''}>
                                        {vital?.bp_supine_sys ? `${vital.bp_supine_sys}/${vital.bp_supine_dia || '-'}` : '-'}
                                    </td>
                                    <td onClick={() => handleCellClick('vitals', slot, 'pulse_pressure')} className={isEditMode && !vital?.pulse_pressure ? 'editable-cell' : ''}>
                                        {vital?.pulse_pressure || '-'}
                                    </td>
                                    <td onClick={() => handleCellClick('vitals', slot, 'bp_sitting')} className={isEditMode && (!vital?.bp_sitting_sys && !vital?.bp_sitting_dia) ? 'editable-cell' : ''}>
                                        {vital?.bp_sitting_sys ? `${vital.bp_sitting_sys}/${vital.bp_sitting_dia || '-'}` : '-'}
                                    </td>
                                    <td onClick={() => handleCellClick('vitals', slot, 'crft')} className={isEditMode && !vital?.crft ? 'editable-cell' : ''}>
                                        {vital?.crft || '-'}
                                    </td>
                                    <td onClick={() => handleCellClick('vitals', slot, 'rr_min')} className={isEditMode && !vital?.rr_min ? 'editable-cell' : ''}>
                                        {vital?.rr_min || '-'}
                                    </td>

                                    {/* Labs */}
                                    <td onClick={() => handleCellClick('labs', slot, 'pcv_percentage')} className={isEditMode && !lab?.pcv_percentage ? 'editable-cell' : ''}>
                                        {lab?.pcv_percentage ? `${lab.pcv_percentage}%` : '-'}
                                    </td>
                                    <td onClick={() => handleCellClick('labs', slot, 'plt_count')} className={isEditMode && !lab?.plt_count ? 'editable-cell' : ''}>
                                        {lab?.plt_count || '-'}
                                    </td>
                                    <td onClick={() => handleCellClick('labs', slot, 'wbc_total')} className={isEditMode && !lab?.wbc_total ? 'editable-cell' : ''}>
                                        {lab?.wbc_total || '-'}
                                    </td>

                                    {/* Obs Cell */}
                                    <td onClick={() => handleCellClick('obs', slot)} className={`obs-cell ${isEditMode && !obs ? 'editable-cell' : ''}`}>
                                        {obs?.observation_text || '-'}
                                    </td>

                                    {/* Urine Cell */}
                                    <td 
                                        onClick={() => handleCellClick('vitals', slot, 'urine')} 
                                        className={`urine-cell ${isEditMode && urine?.urine_val === undefined ? 'editable-cell' : ''}`} 
                                        style={{ backgroundColor: '#fefce8', fontWeight: 600, color: '#ca8a04', textAlign: 'center' }}
                                    >
                                        {urine?.urine_val !== undefined ? urine.urine_val : '-'}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="patient-chart-grid">
            <div className="grid-controls">
                <div className="date-nav">
                    <button className="btn-icon" onClick={() => changeDate(-1)}><ChevronLeft size={20} /></button>
                    <span className="current-date-display">{new Date(currentDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    <button className="btn-icon" onClick={() => changeDate(1)}><ChevronRight size={20} /></button>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    {onToggleCritical && (
                        <button
                            className={`btn-toggle-critical ${isCritical ? 'active' : ''}`}
                            onClick={onToggleCritical}
                            disabled={isUpdating || isNurseView}
                            title={isNurseView ? "Nurses cannot change critical state" : ""}
                            style={isNurseView ? { cursor: 'not-allowed', opacity: 0.7 } : {}}
                        >
                            <Activity size={18} />
                            {isUpdating ? 'Updating...' : (isCritical ? 'Mark Stable' : 'Mark Critical')}
                        </button>
                    )}
                    <button
                        className={`btn-edit-toggle ${isEditMode ? 'active' : ''}`}
                        onClick={() => setIsEditMode(!isEditMode)}
                    >
                        <Edit3 size={18} /> {isEditMode ? 'Exit Edit Mode' : 'Edit Mode'}
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="loading-grid">Loading records for {currentDate}...</div>
            ) : (
                <>
                    {isCritical ? renderInvertedGrid() : renderStandardGrid()}
                </>
            )}

            <VitalsModal
                isOpen={modalOpen.type === 'vitals'}
                onClose={handleModalClose}
                date={currentDate}
                timeSlot={modalOpen.timeSlot}
                bedNo={bedNo}
                hospital_id={hospital_id}
                ward_id={ward_id}
                onSaveSuccess={handleSaveSuccess}
                activeField={modalOpen.activeField}
                isCritical={isCritical}
            />

            <LabsModal
                isOpen={modalOpen.type === 'labs'}
                onClose={handleModalClose}
                date={currentDate}
                timeSlot={modalOpen.timeSlot}
                bedNo={bedNo}
                hospital_id={hospital_id}
                ward_id={ward_id}
                onSaveSuccess={handleSaveSuccess}
                activeField={modalOpen.activeField}
            />

            <ObsModal
                isOpen={modalOpen.type === 'obs'}
                onClose={handleModalClose}
                date={currentDate}
                timeSlot={modalOpen.timeSlot}
                bedNo={bedNo}
                hospital_id={hospital_id}
                ward_id={ward_id}
                onSaveSuccess={handleSaveSuccess}
            />

            <VolumesModal
                isOpen={modalOpen.type === 'volumes'}
                onClose={handleModalClose}
                date={currentDate}
                timeSlot={modalOpen.timeSlot}
                bedNo={bedNo}
                hospital_id={hospital_id}
                ward_id={ward_id}
                onSaveSuccess={handleSaveSuccess}
                activeField={modalOpen.activeField}
                existingData={modalOpen.type === 'volumes' ? getRowData(modalOpen.timeSlot)?.volume : null}
            />
        </div>
    );
};

export default PatientChartGrid;
