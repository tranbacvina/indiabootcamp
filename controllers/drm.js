const { gotScraping } = require('got-scraping');

const handlerDRM = async (req, res) => {
  const { url, referer, media_license_token } = req.body
  const datas = req.files.datas[0].buffer;
  try {
    const response = await gotScraping.post('https://www.udemy.com/media-license-server/validate-auth-token', {
      searchParams: {
        'drm_type': 'widevine',
        'auth_token': media_license_token
      },
      headers: {
        'authority': 'www.udemy.com',
        'accept': '*/*',
        'accept-language': 'en-US,en;q=0.9',
        'content-type': 'application/octet-stream',
        'cookie': '_ga_DFDMXRYPXY=GS1.1.1705154474.1.0.1705154522.0.0.0; __udmy_1_a12z_c24t=VGhlIGFuc3dlciB0byBsaWZlLCB0aGUgdW5pdmVyc2UsIGFuZCBldmVyeXRoaW5nIGlzIDQy; ud_cache_brand=VNen_US; ud_cache_marketplace_country=VN; ud_cache_release=89d5a79f660adce53d9b; ud_cache_version=1; ud_cache_language=en; ud_cache_device=None; ud_firstvisit=2024-01-14T04:22:38.999926+00:00:1rOs19:ih8VkCA2Lqh0hSbozjn_VEQA5VY; blisspoint_fpc=66d01d41-22d3-45c1-b526-036182735d35; ki_r=; ki_s=227428%3A0.0.0.0.0; FPAU=1.1.1437139274.1705206159; dj_session_id=tewdcedvu2yh73fnjhuin4f9lv751xe2; ud_firstvisit=2023-10-07T09:08:06.607068+00:00:1qp3I8:rPwZboODHNNsxumgYfYK20FYrJQ; client_id=bd2565cb7b0c313f5e9bae44961e8db2; ud_last_auth_information="{\\"backend\\": \\"google\\"\\054 \\"suggested_user_email\\": \\"fullbootcamp@gmail.com\\"\\054 \\"suggested_user_name\\": \\"Full\\"\\054 \\"suggested_user_avatar\\": \\"https://img-c.udemycdn.com/user/50x50/anonymous_3.png\\"}:1qp3Tz:6GkLxt75xP7KxHJMcJOrUE0cZbQ"; _mkto_trk=id:273-CKQ-053&token:_mch-udemy.com-1696941501636-67689; _ga_SKDWKFL1MN=GS1.1.1696941501.1.0.1696942758.60.0.0; ki_s=227428%3A0.0.0.0.0%3B228034%3A0.0.0.0.0; __zlcmid=1HVm4O4zpl4G7yF; optimizelyEndUserId=oeu1692987199938r0.5445770641195871; __utmz=218514141.1696241534.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); __utma=218514141.1445187163.1693040610.1696241534.1696241534.1; _fbp=fb.1.1691595071555.182956419; __ssid=8197633742eff383f59b86326c740b6; _rdt_uuid=1696669689662.4f7d8810-54c4-4f2a-ac29-3392b19f52fd; _yjsu_yjad=1696669689.a3b129b1-4334-4c77-bf8c-5afb939e8824; blisspoint_fpc=7279da87-e168-4ad6-9c55-b5df5c329d25; ud_locale=en_US; quality_general=1080; _ga_0PQ8VJ8RDM=GS1.1.1701256924.1.0.1701256926.0.0.0; _ga_7YMFEFLR6Q=deleted; playbackspeed=1; ab.storage.deviceId.5cefca91-d218-4b04-8bdd-c8876ec1908d=%7B%22g%22%3A%2200f460c0-8342-f7df-2674-eb4b4a8337df%22%2C%22c%22%3A1676789138584%2C%22l%22%3A1696225946027%7D; ab.storage.userId.5cefca91-d218-4b04-8bdd-c8876ec1908d=%7B%22g%22%3A%22230743716%22%2C%22c%22%3A1683692281296%2C%22l%22%3A1696225946028%7D; ab.storage.sessionId.5cefca91-d218-4b04-8bdd-c8876ec1908d=%7B%22g%22%3A%228611d837-c6ea-ad2a-5734-de2f5db07798%22%2C%22e%22%3A1696228016836%2C%22c%22%3A1696225946026%2C%22l%22%3A1696226216836%7D; fs_uid=#ZD1RP#8f4e08d0-21f6-4300-9012-e0030387d000:8e93aa5d-fb5c-47cd-80e3-2a17487d26c6:1697337810349::1#/1713921963; __udmy_2_v57r=75452c33c0a14e6b9407284592dc2c39; intercom-device-id-sehj53dd=24ecb651-377d-4626-abe7-5db12a58109f; _gac_UA-109680044-5=1.1704278781.CjwKCAiAqNSsBhAvEiwAn_tmxUZxtAE4b9YvOijq78T7j-x2c38su9A6hv_QYbzQ4lvRf2uxbXmQmhoCww8QAvD_BwE; _gcl_aw=GCL.1704278784.CjwKCAiAqNSsBhAvEiwAn_tmxUZxtAE4b9YvOijq78T7j-x2c38su9A6hv_QYbzQ4lvRf2uxbXmQmhoCww8QAvD_BwE; _gac_UA-12366301-1=1.1704278799.CjwKCAiAqNSsBhAvEiwAn_tmxUZxtAE4b9YvOijq78T7j-x2c38su9A6hv_QYbzQ4lvRf2uxbXmQmhoCww8QAvD_BwE; mute=0; volume=1; _gcl_au=1.1.1313897205.1704468562; caption=vi; muxData=mux_viewer_id=4ad747a2-ec9b-497c-aa40-745b05a0467e&msn=0.06679636417055002&sid=aacbef15-613c-4938-84cb-8f1ef968e8cb&sst=1704856659732&sex=1704858741511; ufb_acc="3@YVcdVE6B-TykGgj60z_WP7JSw1QImdcSyM8cmWlcfeTX-O_w6nip7P5q8S2xJUI3EDR3pfRCiArf0JXErj8v3d-d0rs8VCw4yaw="; OptanonConsent=isGpcEnabled=0&datestamp=Wed+Jan+10+2024+14%3A04%3A20+GMT%2B0700+(Indochina+Time)&version=202306.2.0&browserGpcFlag=0&isIABGlobal=false&hosts=&consentId=077a02f7-df10-47c0-a0a9-e34cb9a2ccb0&interactionCount=1&landingPath=NotLandingPage&groups=C0001%3A1%2CC0003%3A0%2CC0002%3A0&AwaitingReconsent=false; existing_user=true; _fbc=fb.1.1704886912973.IwAR1Wz7guOIArF5CwwGz_Erc1MJpQV1I_oGw3WIH0ElcoSUzRBRuOMmosEYU; ki_r=; ud_user_jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6MjMwNzQzNzE2LCJlbWFpbCI6ImZ1bGxib290Y2FtcEBnbWFpbC5jb20iLCJpc19zdXBlcnVzZXIiOmZhbHNlLCJncm91cF9pZHMiOltdfQ.YhShsx2jjza82YOsfRcjjXgsI25y8gBShIRmpUwp5JE; ud_credit_last_seen="2023-11-20 03:54:12.104854+00:00"; csrftoken=58ADkn3p18oxdDkvq68YgJuO60Kh3Eiw5tr8fgiMapfNLDfdOIFQN1rprLbBqwFg; access_token=SVY5BWJzHEtZ7rwEqBk5Q8nXdFI7+bUz7ggkh5UABnA:GIu3NYZCTciWjBG0u7Zp+aVnEcx20sUcbk1ixepu3pI; dj_session_id=n1piiwpd1ksffv70gq72dezm2ef4ufk4; ki_t=1696669689792%3B1704869807292%3B1704900402317%3B115%3B765; evi="3@DOqE3yys-O_oMpZ7NbrzzZZe-Fq09v0IhTzJ3U7cnl7GL6XQmvrzHoSU6bcdEVttpE4be7ajTXhC0OPT0IDSPex3rLEkiC_NlbY="; ud_rule_vars="eJxtj9FqwzAMRX-l-LVLkGQ7afQtAeM6ymraYmY7fSn99xrawdj2ern3HOmuqs-fUmVxt1hiTZlHaywFrQN4NDIcJwMjHYydaAktnzikdI6ieKfus1pjLvW1dYuvMrd8VgSkO6ROww6RrWWgnuxhANwDMMCsPlrr4tu0pi2cXM1-XWNwJW05iLv5HP3x8qYVST8GWb42Kb9spgPssNks08ioe43Y_vhjC41f5H1vjdd_CIZpYK17gAnM8E14qMcTgIlXnA==:1rNaU5:lVqIFxp74K-FruwDFuJAqLGTDKo"; ud_credit_unseen=0; __udmy_4_a12z=8c0ef922a7296aecb997f70427b75d392f10890b597177f8c149ef6c72d9fc67; __cfruid=93a9c772736bd408130d7f791f35f86419f7ed6f-1705206280; csrftoken=58ADkn3p18oxdDkvq68YgJuO60Kh3Eiw5tr8fgiMapfNLDfdOIFQN1rprLbBqwFg; ud_cache_price_country=US; ud_cache_user=230743716; ud_cache_logged_in=1; cf_clearance=FO3KpcOUXN3MjAa3AXdJ3aIz6XHEgQwL8F6PcrQ3Q6g-1705206282-0-2-ebb5afcb.36646896.bcb4f02b-0.2.1705206282; ud_cache_campaign_code=2021PM20; _gid=GA1.2.1457129621.1705206312; mute=0; __cf_bm=f6_H38QfDenaMfv.p8l1KNK952FsqkfCapLCPMqX6_Y-1705207276-1-AYJAHRhu1+SeIVNIyagBOyRjPTK3DS3cgofXtu9dc+LlpNlhDKXDwP7NPy9chog3vK4B4nW7ioFcOGXJA9qtUsc=; _gat=1; _dc_gtm_UA-12366301-1=1; ki_t=1696669689792%3B1705207310182%3B1705207310182%3B116%3B766; OptanonConsent=isGpcEnabled=0&datestamp=Sun+Jan+14+2024+11%3A42%3A25+GMT%2B0700+(Indochina+Time)&version=202305.1.0&browserGpcFlag=0&isIABGlobal=false&hosts=&consentId=077a02f7-df10-47c0-a0a9-e34cb9a2ccb0&interactionCount=1&landingPath=NotLandingPage&groups=C0001%3A1%2CC0003%3A0%2CC0002%3A0&AwaitingReconsent=false; _ga=GA1.1.1838205984.1696669687; _ga_7YMFEFLR6Q=GS1.1.1705206279.73.1.1705207347.0.0.0; evi="3@nnhOhdeiclMGpF5c5j9lMv98O5DP2npJ75-v2iN0VRw4IweRJXWPl9eQj37dA2qco1Jtndf6UXE2m5ibgQZ7eV2-wgzaC1hEw80="; eventing_session_id=OTcxNjMwMTItOGMwNC00ZD-1705209149013; _dd_s=rum=0&expire=1705208245926; ud_rule_vars="eJxljsFqwzAQRH_F6JrarFYrx95vMQhFXreiCaKSnEvIv1fQBEJ6Hea9mZuqPn9KldVdY4k1ZT5ashiMCeA1yXiaCY44kZ1xDS2fOaT0HUVxp26L2mIu9Y91q6-ytHxRCGh6jb2BTmu2lgEHtNMI-gDAAIv6aK2zb2hNe_hyNftti8GVtOcg7upz9Kfzw1YkvQBZfnYpb2vUg-41dUBMyAYHshMi_FsLzV_k8bfGy7uh_SXGkY0ZAGag8Wm4q_svgVlXng==:1rOsKO:FiLe2p9H7QXTCYMWmwWpF72jwBk"; muxData=mux_viewer_id=4ad747a2-ec9b-497c-aa40-745b05a0467e&msn=0.06679636417055002&sid=c58ae1c5-c631-4cc8-bfad-b01ae11af841&sst=1705207349521&sex=1705208849521',
        'origin': 'https://www.udemy.com',
        'referer': referer,
        'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Microsoft Edge";v="120"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0'
      },
      body: datas,
      responseType: 'buffer'
    }
    )
    console.log(response.body)
    res.setHeader('Content-Type', 'application/octet-stream');
    res.send(response.body); // Send the binary data as the 
  } catch (error) {
    console.log(error)
    res.send(error)

  }
}

module.exports = { handlerDRM }