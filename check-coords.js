const { supabase } = require("./src/lib/supabaseClient.ts");

async function checkCoordinates() {
  try {
    const { data, error } = await supabase
      .from("guides")
      .select("id, locationname, language, coordinates")
      .eq("locationname", "경복궁")
      .eq("language", "ko");
    
    if (error) {
      console.error("DB 오류:", error);
      return;
    }
    
    console.log("경복궁 좌표 데이터:");
    if (data && data.length > 0) {
      data.forEach((guide) => {
        console.log("ID:", guide.id);
        console.log("좌표 타입:", typeof guide.coordinates);
        console.log("배열 여부:", Array.isArray(guide.coordinates));
        console.log("좌표 개수:", guide.coordinates?.length || 0);
        if (guide.coordinates && Array.isArray(guide.coordinates) && guide.coordinates.length > 0) {
          console.log("첫 번째:", guide.coordinates[0]);
        }
      });
    } else {
      console.log("가이드 없음");
    }
  } catch (err) {
    console.error("오류:", err);
  }
}

checkCoordinates();
