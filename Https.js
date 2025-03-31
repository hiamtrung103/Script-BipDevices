(async function() {
      // Lấy Serial của thiết bị hiện tại
      let Serial = GetSerial();
      Log(`Serial hiện tại: ${Serial}`);
  
      // Danh sách các thiết bị với serial và proxyKey tương ứng
      const devices = [
          { serial: "234c500f03037ece", proxyKey: "K9f6227c0d8184f8abd2f991114048e8e" },
          { serial: "1ccb2de721037ece", proxyKey: "K62475b17a9f1408bbcafba223a9f5e3e" },
          { serial: "230bf308830c7ece", proxyKey: "Ka3fa48b0c94448e9907e124bbf4657ba" },
          { serial: "1b9437793d027ece", proxyKey: "Kb4e76aaf9a034c31a330fd1a9ccebcc8" },
          { serial: "2b6456452d057ece", proxyKey: "K5db849bfaade4189a44160be6e6f9bc5" },
          //pe dao
          { serial: "2141e8d4da0c7ece", proxyKey: "K27f36f37383e4c02b268f3f42cfa5116" },
          { serial: "223111160e017ece", proxyKey: "Kd42d028a8d584a1c8c70a637ecf0cb3f" },
          { serial: "1c58c500ed0d7ece", proxyKey: "K5dae17319e8b4395b578367135693cbe" },
          { serial: "22249660720c7ece", proxyKey: "K1daac8b9561444faab873307f5b6056e" },
          { serial: "210db4ec12057ece", proxyKey: "K6fd914bf570d47d7b36af4a0defcf9e2" },
      ];
  
      // Tìm thiết bị tương ứng với Serial hiện tại
      const currentDevice = devices.find(device => device.serial === Serial);
      if (!currentDevice) {
          LogError("Serial Máy không hợp lệ hoặc không được hỗ trợ.");
          return;
      }
      const { proxyKey } = currentDevice;
  
      // Kiểm tra thời gian sử dụng
      const startDate = new Date("2024-12-28");
      const maxDays = 9999;
      async function isWithinTimeLimit() {
          const now = new Date();
          const elapsedDays = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
          return elapsedDays <= maxDays;
      }
      if (!(await isWithinTimeLimit())) {
          LogError("Thời gian sử dụng đã vượt quá giới hạn.");
          return;
      }
      
      const kbMapS9 = {
          ".": [176, 2659,],
          " ": [968, 2619],
          1: [181, 1982],
          2: [522, 1977],
          3: [923, 1987,],
          4: [171, 2218],
          5: [557, 2183,],
          6: [918, 2173],
          7: [151, 2449],
          8: [552, 2378],
          9: [928, 2413],
          0: [557, 2624],
      };
  
      async function SimpleTyping(text, delayFrom, delayTo) {
          const points = [];
          for (const l of text.toLowerCase()) {
              if (kbMapS9[l]) {
                  points.push({
                      x: kbMapS9[l][0],
                      y: kbMapS9[l][1],
                      delay: RandomInt(delayFrom, delayTo)
                  })
              }
          }
          
          await TapMulti(points);
      }
  
      // Chọn vùng cho Proxy (ví dụ: 'bac', 'trung', 'nam', 'random')
      const region = "random";
  
      try {
          // 1. Lấy Proxy mới / Đổi Proxy
          const newProxyUrl = `https://api.kiotproxy.com/api/v1/proxies/new?key=${proxyKey}&region=${region}`;
          const newProxyResponse = await HttpRequest(newProxyUrl);
          // Log("New Proxy Response:", newProxyResponse);
  
          let newProxyData = {};
          if (newProxyResponse && newProxyResponse.body) {
              try {
                  newProxyData = JSON.parse(newProxyResponse.body);
              } catch (e) {
                  LogError("Lỗi parse JSON từ New Proxy Response: " + e);
              }
          }
          
          if (newProxyData && newProxyData.data) {
              const realIp = newProxyData.data.realIpAddress;
              // Sử dụng trực tiếp trường socks5Port nếu có, hoặc parse từ socks5
              const socks5Port = newProxyData.data.socks5Port;
              Log(`Real IP: ${realIp}`);
              Log(`Socks5 Port: ${socks5Port}`);
              await SetNote2(socks5Port)
              const port = GetNote2();
              await OpenApp("com.scheler.superproxy")
              await Delay(500);
              
              const possibles = await BulkGetElements({
                      case1: `[content-desc="Super Proxy"]`,
                  });
                  // Log(`Kết quả BulkGetElements: ${JSON.stringify(possibles)}`);
                  
                  if (Object.values(possibles).some(Boolean)) {
                      await TapByCoordinates(1084, 2263)
                      await Delay(500)
                      await TapByCoordinates(176, 913)
                      await Delay(500)
                      await SendText(realIp);
                      await Delay(800);
                      await TapByCoordinates(156, 1124)
                      await Delay(500)
                      await SimpleTyping(port);
                      await Delay(800)
                      await TapByCoordinates(1340, 171);
                      await Delay(500)
                      await TapByCoordinates(662, 2258)
                  } else {
                      await Delay(1500);
                      await TapByCoordinates(1084, 2263)
                      await Delay(500)
                      await TapByCoordinates(176, 913)
                      await Delay(500)
                      await SendText(realIp);
                      await Delay(800);
                      await TapByCoordinates(156, 1124)
                      await Delay(500)
                      await SimpleTyping(port);
                      await Delay(800)
                      await TapByCoordinates(1340, 171);
                      await Delay(500)
                      await TapByCoordinates(662, 2258)
                  }
              
          } else {
              LogError("Không lấy được thông tin Socks5 Proxy.");
          }
      } catch (error) {
          LogError("Có lỗi khi thực hiện các yêu cầu API: " + error);
      }
  })();