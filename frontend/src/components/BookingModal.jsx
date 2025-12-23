import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import './BookingModal.css';

const BookingModal = ({ slot, onConfirm, onCancel, loading }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        notes: ''
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email) {
            setError('Por favor, rellena los campos obligatorios.');
            return;
        }
        setError('');
        onConfirm(formData);
    };

    if (!slot) return null;

    const slotDate = parseISO(slot);

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Confirmar Cita</h2>
                <p className="slot-info">
                    {format(slotDate, "EEEE, d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Nombre Completo *</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="Juan Pérez"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Correo Electrónico *</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="juan@example.com"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="phone">Teléfono (Opcional)</label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+34 600 000 000"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="notes">Notas Adicionales (Opcional)</label>
                        <textarea
                            id="notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            placeholder="Alguna observación para la cita..."
                        />
                    </div>

                    {error && <p className="modal-error">{error}</p>}

                    <div className="modal-actions">
                        <button type="button" onClick={onCancel} className="cancel-button" disabled={loading}>
                            Cancelar
                        </button>
                        <button type="submit" className="confirm-button" disabled={loading}>
                            {loading ? 'Reservando...' : 'Confirmar Reserva'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookingModal;
