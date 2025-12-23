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
