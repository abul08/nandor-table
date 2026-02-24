import { timetableEvents } from '@/lib/events';

export const dynamic = 'force-dynamic';

export async function GET() {
    const stream = new ReadableStream({
        start(controller) {
            const onUpdate = () => {
                try {
                    controller.enqueue(`data: update\n\n`);
                } catch (e) {
                    // Controller might be closed
                }
            };

            timetableEvents.on('update', onUpdate);

            // Keep connection alive with a heartbeat every 30 seconds
            const heartbeat = setInterval(() => {
                try {
                    controller.enqueue(`: heartbeat\n\n`);
                } catch (e) { }
            }, 30000);

            return () => {
                timetableEvents.off('update', onUpdate);
                clearInterval(heartbeat);
            };
        },
        cancel() {
            // Handled in start clean-up
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
        },
    });
}
