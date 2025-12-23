import { startOfDay, endOfDay, format } from 'date-fns';

const API_URL = '/api';

export const getAvailability = async (date) => {
    const from = startOfDay(date).toISOString();
    const to = endOfDay(date).toISOString();

    const response = await fetch(`${API_URL}/availability?from=${from}&to=${to}`);

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    return response.json();
};

export const createBooking = async (slotStart, userData) => {
    const response = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            slotStart,
            ...userData
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear la reserva');
    }

    return response.json();
};
