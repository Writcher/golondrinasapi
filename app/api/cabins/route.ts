import { prisma } from '../../lib/prisma';
import { NextRequest } from 'next/server';

const { API_KEY } = process.env;

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
        const dateIn = url.searchParams.get('dateIn');
        const dateOut = url.searchParams.get('dateOut');
        const visitorQuantity = url.searchParams.get('visitorQuantity');
    
        if (!dateIn || !dateOut || !visitorQuantity) {
            return new Response(
                JSON.stringify({ error: 'Missing required parameters' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }
    
        const parsedDateIn = new Date(dateIn);
        const parsedDateOut = new Date(dateOut);
        const parsedVisitorQuantity = parseInt(visitorQuantity, 10);
    
        if (isNaN(parsedDateIn.getTime()) || isNaN(parsedDateOut.getTime()) || isNaN(parsedVisitorQuantity)) {
            return new Response(
                JSON.stringify({ error: 'Invalid parameters' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        };
    
        const availableCabins = await prisma.cabin.findMany({
            where: {
                cabinReservations: {
                    none: {
                        AND: [
                            { dateIn: { lt: parsedDateOut } },
                            { dateOut: { gt: parsedDateIn } }
                        ]
                    }
                }
            },
            select: {
                id: true,
                name: true,
                capacity: true
            }
        });

        let selectedCabins = [];
        let totalCapacity = 0;

        if (parsedVisitorQuantity > 6) {
            for (const cabin of availableCabins) {
                if (totalCapacity >= parsedVisitorQuantity) break;
    
                selectedCabins.push(cabin);
                totalCapacity += cabin.capacity.value;
            }
    
            if (totalCapacity >= parsedVisitorQuantity) {
                return new Response(
                    JSON.stringify(selectedCabins),
                    { status: 200, headers: { 'Content-Type': 'application/json' } }
                );

            } else {
                return new Response(
                    JSON.stringify([]),
                    { status: 200, headers: { 'Content-Type': 'application/json' } }
                );

            };
        } else {
            const filteredCabins = availableCabins.filter(cabin => cabin.capacity.value >= parsedVisitorQuantity);

            return new Response(
                JSON.stringify(filteredCabins),
                { status: 200, headers: { 'Content-Type': 'application/json' } }
            );
        };        

    } catch (error) {
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    };
};