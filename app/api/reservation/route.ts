import { PrismaClient } from '@prisma/client';
import { NextRequest } from 'next/server';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { dateIn, dateOut, visitorQuantity, cabins, clientName, price } = body;

        if (!dateIn || !dateOut || !visitorQuantity || !cabins || !clientName || !price) {
            return new Response(
                JSON.stringify({ error: 'Missing required parameters' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        };

        const parsedDateIn = new Date(dateIn);
        const parsedDateOut = new Date(dateOut);
        const parsedVisitorQuantity = parseInt(visitorQuantity, 10);
        const parsedPrice = parseFloat(price);

        if (
            isNaN(parsedDateIn.getTime()) ||
            isNaN(parsedDateOut.getTime()) ||
            isNaN(parsedVisitorQuantity) ||
            !Array.isArray(cabins) ||
            cabins.some(id => isNaN(id)) ||
            typeof clientName !== 'string' ||
            isNaN(parsedPrice)
        ) {
            return new Response(
                JSON.stringify({ error: 'Invalid parameters' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        };

        const createdReservation = await prisma.$transaction(async (prisma) => {
            const reservation = await prisma.reservation.create({
                data: {
                    clientName,
                    price: parsedPrice,
                    visitorQuantity: parsedVisitorQuantity
                },
                select: { id: true }
            });
            const cabinReservations = await prisma.cabinReservation.createMany({
                data: cabins.map((cabinId) => ({
                    dateIn: parsedDateIn,
                    dateOut: parsedDateOut,
                    idCabin: cabinId,
                    idReservation: reservation.id
                }))
            });

            return reservation;
        });

        return new Response(
            JSON.stringify({
                message: 'Reservation created successfully',
                reservationId: createdReservation.id
            }),
            { status: 201, headers: { 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    };
}