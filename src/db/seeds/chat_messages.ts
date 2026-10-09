import { db } from '@/db';
import { chatMessages } from '@/db/schema';

async function main() {
    const demoUserId = 'user_demo_health_chat_01';
    const baseTime = new Date();
    baseTime.setHours(baseTime.getHours() - 2);

    const sampleMessages = [
        {
            userId: demoUserId,
            role: 'user',
            content: "I've been experiencing persistent headaches for the past few days. Should I be concerned?",
            createdAt: new Date(baseTime.getTime()),
        },
        {
            userId: demoUserId,
            role: 'assistant',
            content: "I understand you're concerned about your headaches. Can you tell me more about them? When do they occur, how severe are they, and do you have any other symptoms?",
            createdAt: new Date(baseTime.getTime() + 2 * 60 * 1000),
        },
        {
            userId: demoUserId,
            role: 'user',
            content: "They usually start in the afternoon and are moderate pain. I also feel tired and sometimes sensitive to light.",
            createdAt: new Date(baseTime.getTime() + 5 * 60 * 1000),
        },
        {
            userId: demoUserId,
            role: 'assistant',
            content: "Thank you for sharing those details. Afternoon headaches with fatigue and light sensitivity could be tension headaches or migraines. Have you noticed any triggers like stress, lack of sleep, or screen time?",
            createdAt: new Date(baseTime.getTime() + 7 * 60 * 1000),
        },
        {
            userId: demoUserId,
            role: 'user',
            content: "Now that you mention it, I have been working long hours on the computer lately and not sleeping well.",
            createdAt: new Date(baseTime.getTime() + 10 * 60 * 1000),
        },
        {
            userId: demoUserId,
            role: 'assistant',
            content: "That's likely contributing to your headaches. I recommend: taking regular breaks from screens, staying hydrated, getting 7-8 hours of sleep, and managing stress. If headaches persist or worsen, please consult a doctor.",
            createdAt: new Date(baseTime.getTime() + 13 * 60 * 1000),
        },
        {
            userId: demoUserId,
            role: 'user',
            content: "Thank you. What about over-the-counter pain relief?",
            createdAt: new Date(baseTime.getTime() + 15 * 60 * 1000),
        },
        {
            userId: demoUserId,
            role: 'assistant',
            content: "You can use over-the-counter pain relievers like ibuprofen or acetaminophen as directed. However, avoid overuse as it can lead to rebound headaches. If you need them more than 2-3 times per week, consult a healthcare provider.",
            createdAt: new Date(baseTime.getTime() + 18 * 60 * 1000),
        },
        {
            userId: demoUserId,
            role: 'user',
            content: "That's helpful advice. I'll try improving my sleep schedule first.",
            createdAt: new Date(baseTime.getTime() + 20 * 60 * 1000),
        },
        {
            userId: demoUserId,
            role: 'assistant',
            content: "Excellent approach! Better sleep hygiene often helps significantly. Track your symptoms and if they don't improve in a week or two, or if they worsen, please seek medical attention. Feel free to reach out if you have more questions!",
            createdAt: new Date(baseTime.getTime() + 23 * 60 * 1000),
        }
    ];

    await db.insert(chatMessages).values(sampleMessages);
    
    console.log('✅ Chat messages seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});