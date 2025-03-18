import { PrismaClient } from '@prisma/client';
import { NextRequest } from 'next/server';
import dayjs from 'dayjs';

const { API_KEY } = process.env;
const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return new Response(
                JSON.stringify({ error: 'Unauthorized, API key missing or incorrect' }),
                { status: 401, headers: { 'Content-Type': 'application/json' } }
            );
        };

        const token = authHeader.replace('Bearer ', '');

        if (token !== API_KEY) {
            return new Response(
                JSON.stringify({ error: 'Unauthorized, invalid API key' }),
                { status: 401, headers: { 'Content-Type': 'application/json' } }
            );
        };

        const url = new URL(request.url);
        const month = url.searchParams.get('month');
        const year = url.searchParams.get('year');

        if (!month || !year) {
            return new Response(
                JSON.stringify({ error: 'Missing required parameters' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }
    
        const parsedMonth = parseInt(month, 10);
        const parsedYear = parseInt(year, 10);
    
        if (isNaN(parsedMonth) || isNaN(parsedYear)) {
            return new Response(
                JSON.stringify({ error: 'Invalid parameters' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        };
    
        const startOfMonth = dayjs().year(parsedYear).month(parsedMonth - 1).startOf('month').toDate();
        const endOfMonth = dayjs().year(parsedYear).month(parsedMonth - 1).endOf('month').toDate();

        const reservationList = await prisma.reservation.findMany({
            where: {
                cabinReservations: {
                    some: {
                        OR: [
                            {
                                dateIn: {
                                    gte: startOfMonth,
                                    lte: endOfMonth,
                                },
                            },
                            {
                                dateOut: {
                                    gte: startOfMonth,
                                    lte: endOfMonth,
                                },
                            },
                            {
                                AND: [
                                    {
                                        dateIn: {
                                            lte: endOfMonth,
                                        },
                                    },
                                    {
                                        dateOut: {
                                            gte: startOfMonth,
                                        },
                                    },
                                ],
                            },
                            {
                                AND: [
                                    {
                                        dateIn: {
                                            lte: endOfMonth,
                                        },
                                    },
                                    {
                                        dateOut: {
                                            gte: startOfMonth,
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                },
            },
            include: {
                cabinReservations: true,
            },
        });

        if (!reservationList) {
            return new Response(
                JSON.stringify([]),
                { status: 200, headers: { 'Content-Type': 'application/json' } }
            );
        };

        return new Response(
            JSON.stringify(reservationList),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    };
};