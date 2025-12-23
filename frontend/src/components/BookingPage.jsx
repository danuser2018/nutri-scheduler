import React, { useState, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-day-picker/style.css';
import { getAvailability } from '../api/client';
import './BookingPage.css';

const BookingPage = () => {
    const [selectedDate, setSelectedDate] = useState();
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (selectedDate) {
            loadSlots(selectedDate);
        } else {
            setSlots([]);
        }
    }, [selectedDate]);

    const loadSlots = async (date) => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAvailability(date);
            setSlots(data.availableSlots);
        } catch (err) {
            console.error(err);
            setError('Error cargando disponibilidad. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="booking-container">
            <h1>Reservar Cita</h1>
            <div className="booking-content">
                <div className="calendar-section">
                    <DayPicker
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        locale={es}
                        weekStartsOn={1}
                        showOutsideDays
                        disabled={{ before: new Date() }}
                        modifiersClassNames={{
                            selected: 'my-selected',
                            today: 'my-today'
                        }}
                    />
                </div>

                <div className="slots-section">
                    {selectedDate && (
                        <>
                            <h2>Horarios para {format(selectedDate, 'dd/MM/yyyy')}</h2>

                            {loading && <p>Cargando disponibilidad...</p>}
                            {error && <p className="error">{error}</p>}

                            {!loading && !error && slots.length === 0 && (
                                <p>No hay citas disponibles para este día.</p>
                            )}

                            <div className="slots-grid">
                                {slots.map((slotIso) => {
                                    const dateObj = parseISO(slotIso);
                                    // We show local time in the button
                                    const timeLabel = format(dateObj, 'HH:mm');
                                    return (
                                        <button key={slotIso} className="slot-button">
                                            {timeLabel}
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    )}
                    {!selectedDate && <p>Selecciona una fecha para ver disponibilidad.</p>}
                </div>
            </div>
        </div>
    );
};

export default BookingPage;
