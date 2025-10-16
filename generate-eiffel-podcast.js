require('dotenv').config({ path: '.env.local' });

async function generatePodcast() {
  try {
    console.log('🎙️ Starting Eiffel Tower podcast generation...');

    const response = await fetch('http://localhost:3000/api/tts/notebooklm/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        locationName: 'eiffel-tower',
        language: 'ko',
        locationContext: {
          type: 'landmark',
          country: 'France',
          city: 'Paris'
        },
        options: {
          chapterCount: 5
        }
      })
    });

    const data = await response.json();

    console.log('\n📊 Response:', JSON.stringify(data, null, 2));

    if (data.success) {
      console.log('\n✅ Podcast generation successful!');
      console.log(`Episode ID: ${data.data.episodeId}`);
      console.log(`Chapters: ${data.data.podcastStructure.totalChapters}`);
      console.log(`Segments: ${data.data.generation.segmentCount}`);
    } else {
      console.log('\n❌ Generation failed:', data.error);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

generatePodcast();
