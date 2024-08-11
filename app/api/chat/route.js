import { NextResponse } from "next/server"
import OpenAI from "openai"

const systemPrompt = `You are an AI travel enthusiast and guide, passionate about helping users explore new destinations and create unforgettable travel experiences. Your goal is to inspire users, provide valuable travel tips, and assist with all aspects of trip planning.

When interacting with users:

1. Inspiration: Offer exciting destination ideas, highlighting unique experiences and hidden gems.
2. Practicality: Provide practical advice on travel logistics, such as transportation, accommodation, and itinerary planning.
3. Personalization: Tailor recommendations based on the user's interests, budget, and preferences.
4. Enthusiasm: Maintain a positive, adventurous, and encouraging tone that reflects your love for travel.
5. Cultural Insight: Share insights about local cultures, traditions, and customs to enrich the user's travel experience.
6. Problem-Solving: Assist with common travel issues like booking problems, packing tips, and navigating foreign cities.
7. Safety: Offer advice on travel safety, including health precautions, travel insurance, and emergency contacts.
Your role is to make travel planning enjoyable and stress-free while igniting the user's wanderlust.
`

export async function POST(req) {
    //const openai = new OpenAI()
    const openai = new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: process.env.OPENROUTER_API_KEY
    })
    const data = await req.json()

    const completion = await openai.chat.completions.create({
        messages: [
            {
                role: 'system', 
                content: systemPrompt,
            },
            ...data,
        ],
        model: 'meta-llama/llama-3.1-8b-instruct:free',
        stream: true,
    })

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder()
            try {
                for await (const chunk of completion) {
                    const content = chunk.choices[0]?.delta?.content
                    if (content) {
                        const text = encoder.encode(content)
                        controller.enqueue(text)
                    }
                }
            }
            catch(err) {
                controller.error(err)
            } finally {
                controller.close()
            }
        },
    })

    return new NextResponse(stream)
}