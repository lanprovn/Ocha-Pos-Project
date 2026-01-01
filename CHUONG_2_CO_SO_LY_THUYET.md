CHƯƠNG 2. CƠ SỞ LÝ THUYẾT

2.1. Tìm hiểu về JavaScript và TypeScript

2.1.1. JavaScript

JavaScript là một ngôn ngữ lập trình đa năng, đa nền tảng và linh hoạt, được sử dụng rộng rãi để tạo ra các trang web tương tác và ứng dụng web động. Hỗ trợ các mô hình lập trình hướng đối tượng, lập trình hàm, lập trình sự kiện và mẫu, JavaScript chạy trên một luồng duy nhất nhưng vẫn có khả năng xử lý các tác vụ bất đồng bộ, biến nó thành lựa chọn hàng đầu trong phát triển web hiện đại.

Trong dự án OCHA POS System, JavaScript đóng vai trò nền tảng cho cả phần frontend và backend. Ở phía client, JavaScript được sử dụng để xây dựng giao diện người dùng tương tác với React, xử lý các sự kiện như tạo đơn hàng, cập nhật trạng thái thanh toán, và quản lý trạng thái ứng dụng. Ở phía server, JavaScript thông qua Node.js được sử dụng để xây dựng API RESTful, xử lý logic nghiệp vụ, và quản lý cơ sở dữ liệu.

2.1.2. TypeScript

TypeScript là một ngôn ngữ lập trình được phát triển bởi Microsoft, được xây dựng dựa trên JavaScript với việc bổ sung hệ thống kiểu dữ liệu tĩnh. TypeScript được biên dịch thành JavaScript thuần túy, cho phép các nhà phát triển viết mã an toàn hơn và dễ bảo trì hơn.

Ưu điểm của TypeScript bao gồm tính an toàn kiểu dữ liệu, giúp phát hiện lỗi sớm trong quá trình phát triển thông qua kiểm tra kiểu dữ liệu tại thời điểm biên dịch, giảm thiểu các lỗi runtime phổ biến trong JavaScript. Các công cụ phát triển có thể cung cấp gợi ý mã tự động, điều hướng mã, và tái cấu trúc mã tốt hơn nhờ thông tin kiểu dữ liệu. Kiểu dữ liệu trong TypeScript đóng vai trò như tài liệu sống, giúp các nhà phát triển hiểu rõ hơn về cách sử dụng các hàm và đối tượng. Ngoài ra, TypeScript hỗ trợ đầy đủ các tính năng mới nhất của ECMAScript và có thể biên dịch sang các phiên bản JavaScript cũ hơn để đảm bảo tương thích.

Trong dự án OCHA POS System, TypeScript được sử dụng cho cả frontend và backend, giúp đảm bảo tính nhất quán về kiểu dữ liệu giữa client và server, giảm thiểu lỗi trong quá trình tích hợp, và tăng cường khả năng bảo trì mã nguồn.

2.1.3. Chức năng của JavaScript trong hệ thống POS

JavaScript được sử dụng để thay đổi nội dung, kiểu dáng và thuộc tính của các phần tử HTML trong giao diện POS, tạo ra trải nghiệm người dùng mượt mà và tương tác. Nó xử lý các sự kiện như nhấn chuột, nhập liệu, và các tương tác khác của người dùng trong quá trình tạo đơn hàng, thanh toán, và quản lý kho hàng.

JavaScript sử dụng Fetch API và Axios để giao tiếp với backend API, gửi và nhận dữ liệu về đơn hàng, sản phẩm, khách hàng, và báo cáo. Nó cũng quản lý trạng thái của ứng dụng như giỏ hàng hiện tại, thông tin khách hàng đang chọn, và các filter đang áp dụng. Đặc biệt, JavaScript sử dụng Socket.io để nhận và xử lý các cập nhật thời gian thực về trạng thái đơn hàng, thay đổi kho hàng, và các thông báo hệ thống.

2.1.4. Lợi ích của JavaScript và TypeScript

JavaScript có cú pháp đơn giản và linh hoạt, trong khi TypeScript cung cấp thêm tính an toàn kiểu dữ liệu mà không làm phức tạp quá mức quá trình phát triển. Cả hai đều có thể chạy trên nhiều nền tảng khác nhau, từ trình duyệt web đến máy chủ Node.js, đảm bảo tính nhất quán trong toàn bộ hệ thống.

JavaScript thực hiện các phép toán logic và xử lý dữ liệu ngay trên máy khách, giảm thiểu số lượng yêu cầu đến máy chủ và cải thiện hiệu suất tổng thể. Cộng đồng phát triển rộng lớn với nhiều thư viện và framework hỗ trợ giúp tăng tốc quá trình phát triển. Khả năng xử lý bất đồng bộ cho phép hệ thống xử lý nhiều tác vụ đồng thời mà không bị chặn, đặc biệt quan trọng trong hệ thống POS cần xử lý nhiều đơn hàng cùng lúc.

2.1.5. Giới hạn của JavaScript và cách TypeScript giải quyết

JavaScript là một ngôn ngữ định kiểu yếu, có nghĩa là không cho phép người lập trình xác định kiểu biến một cách rõ ràng. Một biến có thể lưu trữ bất kỳ kiểu dữ liệu nào trong thời gian chạy và các phép toán sẽ giả định kiểu của biến. Điều này có thể dẫn đến những sai lầm vô tình khi viết mã và lỗi trong mã do có lỗi về kiểu.

TypeScript giải quyết vấn đề này bằng cách cung cấp hệ thống kiểu dữ liệu tĩnh, cho phép các nhà phát triển khai báo kiểu dữ liệu rõ ràng và phát hiện lỗi tại thời điểm biên dịch thay vì runtime. Điều này đặc biệt quan trọng trong hệ thống POS, nơi tính chính xác của dữ liệu là cực kỳ quan trọng cho việc quản lý đơn hàng, kho hàng, và tài chính.

2.2. Tổng quan về ReactJS

2.2.1. ReactJS

ReactJS là một thư viện mã nguồn mở do Facebook phát triển, được sử dụng để tạo ra các ứng dụng web hấp dẫn với hiệu suất cao, tốc độ tải nhanh và mã nguồn tối ưu. Các trang web sử dụng ReactJS đều có khả năng chạy mượt mà, mở rộng dễ dàng và thao tác đơn giản.

Điểm mạnh của ReactJS nằm ở khả năng tập trung vào từng phần riêng lẻ. Thay vì làm việc trên toàn bộ ứng dụng, ReactJS cho phép các lập trình viên chia nhỏ giao diện phức tạp của người dùng thành các thành phần đơn giản hơn. Điều này có nghĩa là việc render dữ liệu không chỉ được thực hiện trên server mà còn có thể thực hiện trực tiếp trên client khi sử dụng ReactJS.

Trong dự án OCHA POS System, ReactJS được sử dụng để xây dựng giao diện người dùng cho hệ thống POS, bao gồm các màn hình quản lý đơn hàng, quản lý sản phẩm, quản lý khách hàng, báo cáo, và màn hình hiển thị đơn hàng cho bếp và bar. Việc sử dụng ReactJS giúp tạo ra một giao diện người dùng mượt mà, phản hồi nhanh, và dễ dàng bảo trì.

2.2.2. Các tính năng chính của ReactJS

JSX là một tiện ích mở rộng của React, giúp việc thay đổi cây DOM trở nên dễ dàng hơn thông qua mã HTML-style đơn giản. Đây là một trong những tính năng tốt và dễ sử dụng của React. Biểu thức JavaScript có thể được sử dụng trong các file .jsx hoặc .tsx bằng cách đặt chúng trong cặp dấu ngoặc nhọn.

Một trang web được xây dựng bằng ReactJS là sự kết hợp của nhiều component, không phải là một template duy nhất như thông thường. Các component hoạt động giống như các hàm JavaScript, giúp tạo ra mã dễ dàng hơn bằng cách tách logic thành các đoạn mã độc lập có thể tái sử dụng. Trong OCHA POS System, các component như OrderForm, ProductCard, CustomerList, và Dashboard được tái sử dụng ở nhiều nơi khác nhau trong ứng dụng.

Virtual DOM là một phần quan trọng mà hầu như các framework đều sử dụng, bao gồm cả ReactJS. Người dùng không cần thao tác trực tiếp trên DOM mà vẫn có thể thấy được các thay đổi trên view. Virtual DOM đóng vai trò như một mô hình và kiêm cả vai trò của view, nên sự thay đổi một trong hai yếu tố sẽ kéo theo các yếu tố khác thay đổi. Điều này giúp cải thiện hiệu suất đáng kể, đặc biệt quan trọng trong hệ thống POS nơi cần cập nhật giao diện thường xuyên.

Props là các tham số được truyền qua lại giữa các React Components, với cú pháp tương tự như các thuộc tính HTML. State là một đối tượng lưu trữ giá trị của các thuộc tính bên trong component và chỉ tồn tại trong phạm vi của component đó. Mỗi khi giá trị của state thay đổi, component sẽ được render lại. Trong OCHA POS System, state được sử dụng để quản lý giỏ hàng hiện tại, trạng thái đăng nhập, và các filter đang áp dụng.

React Hooks là các hàm đặc biệt cho phép sử dụng state và các tính năng khác của React trong functional components. Các hooks như useState, useEffect, useContext được sử dụng rộng rãi trong OCHA POS System để quản lý trạng thái và side effects. Context API cho phép chia sẻ dữ liệu giữa các component mà không cần truyền props qua nhiều cấp. Trong OCHA POS System, Context API được sử dụng để quản lý trạng thái xác thực người dùng, thông tin đơn hàng hiện tại, và kết nối Socket.io.

2.2.3. Ưu điểm khi sử dụng ReactJS

ReactJS tạo ra một Virtual DOM, nơi các Component tồn tại và có thể cập nhật một cách hiệu quả. Điều này cho phép ReactJS tính toán trước các thay đổi và thực hiện chúng mà không cần thao tác trực tiếp trên DOM thật, từ đó cải thiện hiệu suất đáng kể. Trong hệ thống POS, điều này đặc biệt quan trọng khi cần cập nhật nhiều đơn hàng và sản phẩm cùng lúc.

Việc viết code trở nên dễ dàng hơn nhờ cú pháp JSX, cho phép trộn lẫn HTML và JavaScript, giúp việc thêm mã vào hàm Render mà không cần nối chuỗi. JSX cũng hỗ trợ chuyển đổi các đoạn HTML thành các hàm khởi động thông qua bộ biến đổi, mang lại trải nghiệm lập trình mượt mà và tiện lợi hơn.

ReactJS cung cấp nhiều công cụ phát triển thông qua các tiện ích mở rộng của Chrome, giúp lập trình viên debug code dễ dàng và quan sát trực tiếp Virtual DOM. Cộng đồng phát triển lớn mạnh với nhiều thư viện và công cụ hỗ trợ giúp tăng tốc quá trình phát triển và giải quyết các vấn đề phổ biến. Khả năng tạo và tái sử dụng các component giúp giảm thiểu code trùng lặp và tăng tính nhất quán trong giao diện người dùng.

2.2.4. Nhược điểm của ReactJS

React là một thư viện dành cho việc render giao diện, không phải là một MVC framework hoàn chỉnh. Được phát triển bởi Facebook, React tập trung vào việc render giao diện mà không bao gồm phần Model và Controller, do đó cần kết hợp với các thư viện khác như React Router để điều hướng, Axios để giao tiếp với API, và Context API hoặc các thư viện quản lý state khác để quản lý trạng thái ứng dụng.

ReactJS có thể khó tiếp cận đối với những người mới học lập trình web, đặc biệt là các khái niệm như JSX, Virtual DOM, và Hooks. Tuy nhiên, với sự hỗ trợ của TypeScript và các công cụ phát triển hiện đại, việc học ReactJS đã trở nên dễ dàng hơn. Để xây dựng một ứng dụng hoàn chỉnh, ReactJS cần được kết hợp với các công cụ khác như React Router cho điều hướng, Axios cho HTTP requests, và các thư viện quản lý state cho các ứng dụng phức tạp.

2.3. Tìm hiểu về RESTful API

2.3.1. RESTful API

RESTful API là một tiêu chuẩn thiết kế API cho các ứng dụng web, tập trung vào việc quản lý và tương tác với các tài nguyên hệ thống như tệp văn bản, hình ảnh, âm thanh, video và dữ liệu động. Tiêu chuẩn này chú trọng vào việc định dạng và truyền tải trạng thái của các tài nguyên thông qua giao thức HTTP, giúp tối ưu hóa quá trình giao tiếp và xử lý giữa máy khách và máy chủ.

Trong dự án OCHA POS System, RESTful API được sử dụng để xây dựng backend API, cho phép frontend giao tiếp với server để thực hiện các thao tác như tạo đơn hàng, quản lý sản phẩm, quản lý khách hàng, và truy xuất báo cáo. API được thiết kế theo các nguyên tắc REST, sử dụng các phương thức HTTP chuẩn như GET, POST, PUT, DELETE để thực hiện các thao tác CRUD trên các tài nguyên.

2.3.2. Các thành phần chính của RESTful API

API là một tập hợp các quy tắc và cơ chế mà qua đó, một ứng dụng hoặc một thành phần sẽ tương tác với một ứng dụng hoặc thành phần khác. API có thể trả về dữ liệu mà bạn cần cho ứng dụng của mình dưới các định dạng phổ biến như JSON hoặc XML. Trong OCHA POS System, API trả về dữ liệu dưới định dạng JSON, bao gồm thông tin về đơn hàng, sản phẩm, khách hàng, và báo cáo.

REST là một kiểu kiến trúc để viết API, dựa trên việc chuyển đổi cấu trúc dữ liệu. Nó sử dụng các phương thức HTTP đơn giản để tạo ra giao tiếp giữa các máy. Thay vì sử dụng một URL cụ thể để xử lý thông tin người dùng, REST gửi các yêu cầu HTTP như GET, POST, PUT, DELETE đến một URL để xử lý dữ liệu.

RESTful API là một tiêu chuẩn trong việc thiết kế API cho các ứng dụng web để quản lý các tài nguyên. RESTful là một trong những kiểu thiết kế API phổ biến nhất hiện nay, cho phép các ứng dụng web, di động giao tiếp với nhau một cách hiệu quả.

Chức năng quan trọng nhất của REST là quy định cách sử dụng các phương thức HTTP như GET, POST, PUT, DELETE và cách định dạng các URL cho ứng dụng web để quản lý các tài nguyên. RESTful không quy định logic mã nguồn ứng dụng và không bị giới hạn bởi ngôn ngữ lập trình ứng dụng. Bất kỳ ngôn ngữ hoặc framework nào cũng có thể được sử dụng để thiết kế một RESTful API.

2.3.3. Các phương thức HTTP trong RESTful API

Phương thức GET được sử dụng để truy xuất dữ liệu từ server. Trong OCHA POS System, GET được sử dụng để lấy danh sách sản phẩm, đơn hàng, khách hàng, và các báo cáo.

Phương thức POST được sử dụng để tạo mới tài nguyên trên server. Trong OCHA POS System, POST được sử dụng để tạo đơn hàng mới, thêm sản phẩm, đăng ký khách hàng mới, và thực hiện thanh toán.

Phương thức PUT và PATCH được sử dụng để cập nhật tài nguyên hiện có. PUT thường được sử dụng để cập nhật toàn bộ tài nguyên, trong khi PATCH được sử dụng để cập nhật một phần của tài nguyên.

Phương thức DELETE được sử dụng để xóa tài nguyên khỏi server. Trong OCHA POS System, DELETE được sử dụng để xóa sản phẩm, hủy đơn hàng, và xóa khách hàng.

2.3.4. Ưu điểm của RESTful API

RESTful API sử dụng các phương thức HTTP chuẩn và URL có cấu trúc rõ ràng, giúp các nhà phát triển dễ dàng hiểu và sử dụng API. Nó không phụ thuộc vào ngôn ngữ lập trình cụ thể, cho phép frontend và backend sử dụng các công nghệ khác nhau.

RESTful API có thể dễ dàng mở rộng để hỗ trợ thêm các tính năng mới mà không ảnh hưởng đến các tính năng hiện có. Nó tạo ra sự tách biệt rõ ràng giữa client và server, cho phép phát triển và triển khai độc lập. Ngoài ra, RESTful API hỗ trợ caching thông qua các header HTTP, giúp cải thiện hiệu suất và giảm tải cho server.

2.4. Tổng quan về Node.js và Express.js

2.4.1. Node.js

Node.js là một runtime environment được phát triển từ năm 2009, độc lập dựa trên trình thông dịch JavaScript của Chrome. Với Node.js, bạn có thể xây dựng các ứng dụng một cách nhanh chóng và dễ dàng mở rộng sau khi hoàn thành. Lý do Node.js được sử dụng rộng rãi là vì phần core của nó chủ yếu được viết bằng C++, mang lại tốc độ xử lý cao và hiệu năng vượt trội. Điều này giúp các công việc lập trình diễn ra nhanh chóng và hiệu quả. Đặc biệt, các ứng dụng viết bằng Node.js có tốc độ xử lý nhanh và hỗ trợ thời gian thực. Node.js thường được sử dụng để phát triển các ứng dụng có lượng truy cập lớn, cần mở rộng, cải tiến liên tục hoặc để khởi tạo các dự án khởi nghiệp một cách nhanh chóng nhất có thể.

Trong dự án OCHA POS System, Node.js được sử dụng để xây dựng backend server, xử lý các yêu cầu từ frontend, quản lý cơ sở dữ liệu, và cung cấp các API RESTful. Node.js đặc biệt phù hợp cho hệ thống POS vì khả năng xử lý nhiều yêu cầu đồng thời và hỗ trợ giao tiếp thời gian thực thông qua Socket.io.

2.4.2. Express.js

Express.js là một framework web nhỏ gọn và linh hoạt cho Node.js, cung cấp một tập hợp các tính năng mạnh mẽ cho việc xây dựng các ứng dụng web và API. Express.js đơn giản hóa việc tạo ra các route, middleware, và xử lý HTTP requests và responses.

Express.js cung cấp một hệ thống routing mạnh mẽ và linh hoạt, cho phép định nghĩa các endpoint API một cách dễ dàng. Trong OCHA POS System, Express.js được sử dụng để định nghĩa các route cho đơn hàng, sản phẩm, khách hàng, và báo cáo.

Middleware là các hàm được thực thi trong quá trình xử lý request, cho phép thực hiện các tác vụ như xác thực, logging, parsing request body, và xử lý lỗi. Trong OCHA POS System, middleware được sử dụng để xác thực JWT, validate dữ liệu đầu vào, và xử lý lỗi. Express.js hỗ trợ nhiều template engine khác nhau, mặc dù trong OCHA POS System, chúng ta chỉ sử dụng Express.js để xây dựng API JSON. Express.js cũng có thể phục vụ các file tĩnh như hình ảnh, CSS, và JavaScript.

2.4.3. Một số ưu điểm khi sử dụng Node.js và Express.js

Node.js có thể mở rộng các ứng dụng của nó bằng cách sử dụng cơ chế không đồng bộ để xử lý các yêu cầu đồng thời một cách hiệu quả. Bởi vì Node.js hoạt động trên một luồng đơn, khi có một yêu cầu đến, nó sẽ bắt đầu xử lý yêu cầu đó và sẵn sàng để xử lý các yêu cầu tiếp theo. Điều này đặc biệt quan trọng trong hệ thống POS, nơi cần xử lý nhiều đơn hàng và yêu cầu cùng lúc.

JavaScript V8, dùng bởi Node.js và Google Chrome, cung cấp thời gian thực thi code nhanh hơn nhờ một trình bao bọc trung tâm cho JavaScript. Công cụ JavaScript V8 của Google Chrome là cơ sở của Node.js, cho phép mã được thực thi nhanh hơn bằng cách biên dịch JavaScript thành mã máy, tạo ra sự triển khai hiệu quả và nhanh chóng hơn.

Node.js vượt trội về khả năng tương thích đa nền tảng trên nhiều hệ điều hành khác nhau như Windows, UNIX, LINUX, MacOS và thiết bị di động. Việc sử dụng JavaScript giúp hầu hết các nhà phát triển có thể truy cập được, tận dụng sự quen thuộc của họ với ngôn ngữ này. Node.js có hệ sinh thái npm rất lớn với hàng trăm nghìn package có sẵn, giúp tăng tốc quá trình phát triển. Express.js cung cấp một API đơn giản và linh hoạt, cho phép các nhà phát triển xây dựng ứng dụng theo cách họ muốn mà không bị ràng buộc bởi các quy tắc cứng nhắc.

2.4.4. Một số nhược điểm của Node.js

Node.js được thiết kế cho các ứng dụng I/O-intensive, không phù hợp cho các tác vụ tính toán nặng như xử lý hình ảnh phức tạp hoặc các thuật toán phức tạp. Tuy nhiên, trong hệ thống POS, điều này không phải là vấn đề lớn vì hầu hết các tác vụ đều liên quan đến I/O như đọc và ghi cơ sở dữ liệu và xử lý HTTP requests.

Mặc dù async/await đã giải quyết phần lớn vấn đề này, nhưng việc xử lý bất đồng bộ có thể dẫn đến code phức tạp nếu không được quản lý cẩn thận. Do tính chất mã nguồn mở và cộng đồng lớn, có thể có nhiều cách tiếp cận khác nhau để giải quyết cùng một vấn đề, dẫn đến thiếu tính nhất quán trong codebase.

2.5. Tổng quan về PostgreSQL và Prisma ORM

2.5.1. PostgreSQL

PostgreSQL là một hệ quản trị cơ sở dữ liệu quan hệ mã nguồn mở, mạnh mẽ và đáng tin cậy. PostgreSQL được phát triển với mục tiêu tuân thủ các tiêu chuẩn SQL và cung cấp nhiều tính năng tiên tiến như ACID compliance, foreign keys, triggers, views, và stored procedures.

PostgreSQL đảm bảo tính toàn vẹn dữ liệu thông qua ACID compliance, đảm bảo các giao dịch được xử lý một cách an toàn và nhất quán. Nó được tối ưu hóa cho các ứng dụng có lượng truy cập lớn và phức tạp, với khả năng xử lý nhiều truy vấn đồng thời. PostgreSQL hỗ trợ nhiều kiểu dữ liệu phong phú, bao gồm JSON, arrays, và các kiểu dữ liệu tùy chỉnh, cho phép lưu trữ và truy vấn dữ liệu phức tạp. Ngoài ra, PostgreSQL là mã nguồn mở và miễn phí, không có chi phí giấy phép.

Trong dự án OCHA POS System, PostgreSQL được sử dụng để lưu trữ tất cả dữ liệu của hệ thống, bao gồm thông tin về đơn hàng, sản phẩm, khách hàng, công thức sản phẩm, và các báo cáo. PostgreSQL đảm bảo tính toàn vẹn dữ liệu và hiệu suất cao cho hệ thống POS.

2.5.2. Prisma ORM

Prisma là một ORM hiện đại cho Node.js và TypeScript, cung cấp một cách tiếp cận type-safe để làm việc với cơ sở dữ liệu. Prisma bao gồm Prisma Client, Prisma Migrate, và Prisma Studio.

Prisma tự động tạo ra các type TypeScript dựa trên schema, đảm bảo tính an toàn kiểu dữ liệu trong suốt quá trình phát triển. Prisma Migrate tự động tạo ra các file migration SQL dựa trên thay đổi schema, giúp quản lý phiên bản cơ sở dữ liệu dễ dàng hơn. Prisma cung cấp autocomplete và IntelliSense tốt trong IDE, giúp tăng tốc độ phát triển và giảm lỗi. Prisma Client cung cấp một API truy vấn trực quan và mạnh mẽ, hỗ trợ các thao tác phức tạp như nested queries, transactions, và aggregations. Prisma Studio cung cấp giao diện GUI để xem và chỉnh sửa dữ liệu trong cơ sở dữ liệu, hữu ích cho việc debugging và quản lý dữ liệu trong quá trình phát triển.

Trong dự án OCHA POS System, Prisma được sử dụng để định nghĩa schema cơ sở dữ liệu, thực hiện migrations, và truy vấn dữ liệu từ các controller. Prisma giúp đảm bảo tính nhất quán giữa schema và code, và cung cấp type safety cho toàn bộ ứng dụng.

2.5.3. Schema và Migration trong Prisma

Prisma sử dụng một file schema để định nghĩa cấu trúc cơ sở dữ liệu. Schema này được viết bằng ngôn ngữ Prisma Schema Language, một ngôn ngữ khai báo để định nghĩa các model, quan hệ, và các thuộc tính của chúng.

Prisma Migrate là công cụ để quản lý các thay đổi schema và áp dụng chúng vào cơ sở dữ liệu. Khi schema được thay đổi, Prisma Migrate tự động tạo ra các file migration SQL, cho phép theo dõi lịch sử thay đổi và áp dụng chúng một cách có kiểm soát.

2.6. Tìm hiểu về Socket.io

2.6.1. Socket.io

Socket.io là một thư viện JavaScript cho phép giao tiếp thời gian thực, hai chiều giữa client và server. Socket.io được xây dựng trên WebSocket protocol nhưng cung cấp thêm nhiều tính năng như fallback mechanisms, room support, và automatic reconnection.

Socket.io cho phép server và client gửi và nhận dữ liệu ngay lập tức mà không cần client phải gửi request. Nó cho phép tổ chức các kết nối vào các phòng và không gian tên, hữu ích cho việc gửi tin nhắn đến một nhóm cụ thể các client. Socket.io tự động kết nối lại khi kết nối bị mất, đảm bảo tính liên tục của ứng dụng. Nó hỗ trợ nhiều phương thức vận chuyển như WebSocket, polling, và long-polling, đảm bảo hoạt động trên nhiều trình duyệt và môi trường khác nhau.

2.6.2. Ứng dụng Socket.io trong hệ thống POS

Trong dự án OCHA POS System, Socket.io được sử dụng để cung cấp các cập nhật thời gian thực cho các tính năng sau. Khi một đơn hàng được tạo, cập nhật, hoặc thay đổi trạng thái, tất cả các client đang kết nối sẽ nhận được thông báo ngay lập tức. Điều này đặc biệt quan trọng cho màn hình hiển thị đơn hàng cho bếp và bar, nơi cần cập nhật ngay lập tức khi có đơn hàng mới hoặc thay đổi trạng thái.

Khi kho hàng được cập nhật, ví dụ khi một đơn hàng được tạo và kho hàng được trừ tự động, tất cả các client sẽ nhận được thông báo về thay đổi kho hàng. Socket.io được sử dụng để gửi các thông báo hệ thống như cảnh báo hết hàng, thông báo thanh toán thành công, và các sự kiện quan trọng khác. Nó đảm bảo tất cả các client đang mở ứng dụng đều có dữ liệu đồng bộ và cập nhật nhất.

2.6.3. Ưu điểm của Socket.io

Socket.io sử dụng WebSocket, một giao thức hiệu quả hơn HTTP cho giao tiếp thời gian thực, giảm overhead và độ trễ. Nó cung cấp một API đơn giản và trực quan, dễ dàng tích hợp vào các ứng dụng Node.js và React. Socket.io tự động chọn phương thức vận chuyển tốt nhất dựa trên khả năng của trình duyệt và môi trường, đảm bảo hoạt động trên nhiều nền tảng khác nhau. Cộng đồng phát triển lớn và tài liệu đầy đủ giúp giải quyết các vấn đề và học hỏi các best practices.

2.7. Tổng quan về Tailwind CSS

2.7.1. Tailwind CSS

Tailwind CSS là một framework CSS utility-first mã nguồn mở, được thiết kế để tăng tốc quá trình phát triển giao diện người dùng bằng cách cung cấp các lớp CSS có sẵn để xây dựng các thiết kế tùy chỉnh trực tiếp trong HTML. Khác với các framework CSS truyền thống như Bootstrap, Tailwind CSS không cung cấp các component có sẵn mà thay vào đó cung cấp các utility classes có thể kết hợp để tạo ra các thiết kế độc đáo.

Tailwind CSS sử dụng các lớp utility nhỏ, có thể kết hợp để xây dựng các thiết kế phức tạp. Ví dụ, thay vì viết CSS tùy chỉnh, bạn có thể sử dụng các lớp như flex, items-center, justify-between, bg-blue-500, text-white. Tailwind CSS cung cấp các breakpoint mặc định và các prefix tương ứng để tạo ra các thiết kế responsive dễ dàng. Nó có thể được tùy chỉnh hoàn toàn thông qua file cấu hình, cho phép bạn định nghĩa màu sắc, font chữ, spacing, và các giá trị khác phù hợp với thiết kế của bạn. Trong quá trình build, Tailwind CSS tự động loại bỏ các lớp CSS không được sử dụng, giảm đáng kể kích thước file CSS cuối cùng.

2.7.2. Ưu điểm của Tailwind CSS

Với các utility classes có sẵn, bạn có thể nhanh chóng xây dựng giao diện mà không cần viết CSS tùy chỉnh hoặc chuyển đổi giữa các file HTML và CSS. Tailwind CSS sử dụng một hệ thống thiết kế nhất quán với các giá trị được định nghĩa sẵn, giúp đảm bảo tính nhất quán trong toàn bộ ứng dụng. Nhờ tính năng purge CSS, file CSS cuối cùng chỉ chứa các lớp được sử dụng thực tế, giúp giảm kích thước file và cải thiện hiệu suất tải trang. Vì các style được định nghĩa trực tiếp trong HTML hoặc JSX, bạn không cần phải tìm kiếm trong các file CSS riêng biệt để hiểu cách một phần tử được style. Tailwind CSS không giới hạn bạn trong các component có sẵn, cho phép bạn tạo ra các thiết kế độc đáo và phù hợp với nhu cầu cụ thể của dự án.

2.7.3. Nhược điểm của Tailwind CSS

Mặc dù Tailwind CSS dễ học cơ bản, nhưng để sử dụng hiệu quả, bạn cần học và ghi nhớ nhiều utility classes khác nhau. Khi sử dụng nhiều utility classes, các thẻ HTML hoặc JSX có thể trở nên dài và khó đọc. Tuy nhiên, điều này có thể được giải quyết bằng cách sử dụng các component và extract các lớp phổ biến thành các component riêng. Tailwind CSS yêu cầu một quy trình build để hoạt động, điều này có thể làm phức tạp quá trình setup ban đầu.

Trong dự án OCHA POS System, Tailwind CSS được sử dụng để xây dựng toàn bộ giao diện người dùng, từ các form nhập liệu đến các bảng dữ liệu, từ các nút bấm đến các modal và notification. Tailwind CSS giúp tạo ra một giao diện hiện đại, responsive, và nhất quán trong toàn bộ ứng dụng.

2.8. Tổng quan về Vite

2.8.1. Vite

Vite là một build tool và development server hiện đại cho các ứng dụng web frontend, được phát triển bởi Evan You. Vite được thiết kế để cung cấp trải nghiệm phát triển nhanh hơn và hiệu quả hơn so với các build tool truyền thống như Webpack.

Vite sử dụng ES modules native trong trình duyệt để phục vụ mã nguồn trong quá trình phát triển, loại bỏ việc bundle toàn bộ ứng dụng trước khi khởi động server. Điều này giúp khởi động server nhanh hơn đáng kể, ngay cả với các dự án lớn. Vite cung cấp HMR cực kỳ nhanh bằng cách chỉ cập nhật các module đã thay đổi mà không cần reload toàn bộ trang. Trong quá trình build cho production, Vite sử dụng Rollup để tạo ra các bundle được tối ưu hóa, với code splitting tự động và tree shaking. Vite hỗ trợ nhiều framework khác nhau như React, Vue, Svelte, và vanilla JavaScript thông qua các plugin.

2.8.2. Ưu điểm của Vite

Vite khởi động development server gần như ngay lập tức, ngay cả với các dự án lớn, giúp tăng tốc quá trình phát triển. Các thay đổi trong code được phản ánh ngay lập tức trong trình duyệt mà không cần reload trang, giúp tăng năng suất làm việc. Vite có cấu hình mặc định hợp lý và chỉ cần cấu hình tối thiểu để bắt đầu, giúp giảm thời gian setup. Vite hỗ trợ TypeScript out-of-the-box mà không cần cấu hình thêm. Vite có một hệ sinh thái plugin phong phú, cho phép mở rộng và tùy chỉnh theo nhu cầu của dự án.

Trong dự án OCHA POS System, Vite được sử dụng làm build tool cho frontend React application, cung cấp trải nghiệm phát triển nhanh và hiệu quả, và tạo ra các bundle được tối ưu hóa cho production.

2.9. Tìm hiểu về JWT

2.9.1. JWT

JWT là một tiêu chuẩn mở để truyền thông tin an toàn giữa các bên dưới dạng JSON object. Token này có thể được xác minh và đáng tin cậy vì nó được ký số. JWT có thể được ký bằng secret hoặc một cặp public và private key.

JWT bao gồm ba phần được phân tách bởi dấu chấm. Phần đầu tiên là Header, chứa metadata về token, bao gồm loại token và thuật toán ký được sử dụng. Phần thứ hai là Payload, chứa các claims về người dùng và các dữ liệu khác. Claims có thể là registered claims như iss, exp, sub, public claims, hoặc private claims. Phần thứ ba là Signature, được tạo ra bằng cách mã hóa header và payload với secret key, đảm bảo tính toàn vẹn của token.

2.9.2. Ưu điểm của JWT

JWT là stateless, có nghĩa là server không cần lưu trữ session trên server. Tất cả thông tin cần thiết đều được chứa trong token, giúp giảm tải cho server và dễ dàng scale. JWT được ký số, đảm bảo tính toàn vẹn của token và ngăn chặn việc giả mạo. JWT có thể chứa bất kỳ thông tin nào trong payload, cho phép tùy chỉnh theo nhu cầu của ứng dụng. JWT có thể được sử dụng để xác thực giữa các domain khác nhau, hữu ích cho các ứng dụng microservices.

2.9.3. Ứng dụng JWT trong hệ thống POS

Trong dự án OCHA POS System, JWT được sử dụng để xác thực và phân quyền người dùng. Khi người dùng đăng nhập thành công, server tạo ra một JWT token chứa thông tin về người dùng như user ID và role, sau đó gửi về client. Client lưu trữ token này thường trong localStorage hoặc cookie và gửi kèm theo mỗi request đến server.

Server xác minh token trong mỗi request và kiểm tra quyền của người dùng dựa trên thông tin trong token. Điều này cho phép kiểm soát quyền truy cập vào các tài nguyên khác nhau của hệ thống. JWT đảm bảo rằng chỉ những người dùng đã xác thực mới có thể truy cập vào các API được bảo vệ.

2.10. Tổng quan về hệ thống Point of Sale

2.10.1. Hệ thống POS

Hệ thống Point of Sale là một hệ thống quản lý bán hàng được sử dụng để xử lý các giao dịch bán hàng tại điểm bán. Hệ thống POS hiện đại không chỉ đơn giản là một máy tính tiền mà còn là một giải pháp quản lý toàn diện cho doanh nghiệp, bao gồm quản lý đơn hàng, quản lý kho hàng, quản lý khách hàng, và báo cáo phân tích.

Các thành phần chính của hệ thống POS bao gồm quản lý đơn hàng, cho phép nhân viên tạo đơn hàng, thêm sản phẩm vào đơn hàng, và xử lý thanh toán. Quản lý sản phẩm bao gồm quản lý danh mục sản phẩm, giá cả, và thông tin chi tiết về từng sản phẩm. Quản lý kho hàng theo dõi số lượng tồn kho, tự động trừ kho khi có đơn hàng, và cảnh báo khi hết hàng. Quản lý khách hàng lưu trữ thông tin khách hàng, lịch sử mua hàng, và hệ thống tích điểm. Báo cáo và phân tích cung cấp các báo cáo về doanh thu, sản phẩm bán chạy, và các phân tích khác để hỗ trợ ra quyết định kinh doanh. Quản lý thanh toán hỗ trợ nhiều phương thức thanh toán như tiền mặt, thẻ, và QR code.

2.10.2. Yêu cầu của hệ thống POS hiện đại

Hệ thống POS cần xử lý các giao dịch nhanh chóng để không làm chậm quá trình phục vụ khách hàng. Hệ thống cần hoạt động ổn định và không bị gián đoạn, đặc biệt quan trọng trong giờ cao điểm. Giao diện người dùng cần đơn giản, trực quan, và dễ sử dụng để nhân viên có thể học và sử dụng nhanh chóng.

Hệ thống POS cần có khả năng tích hợp với các hệ thống khác như hệ thống kế toán, hệ thống quản lý nhân sự, và các dịch vụ thanh toán bên thứ ba. Hệ thống cần đảm bảo tính bảo mật của dữ liệu khách hàng và thông tin thanh toán. Hệ thống cần có khả năng mở rộng để đáp ứng nhu cầu phát triển của doanh nghiệp.

2.10.3. Xu hướng phát triển hệ thống POS

Các hệ thống POS hiện đại ngày càng chuyển sang mô hình cloud-based, cho phép truy cập từ bất kỳ đâu và giảm chi phí bảo trì. Nhiều hệ thống POS hiện đại được thiết kế với mobile-first approach, cho phép sử dụng trên các thiết bị di động như tablet và smartphone.

Các hệ thống POS hiện đại sử dụng công nghệ real-time để đồng bộ hóa dữ liệu giữa các thiết bị và điểm bán khác nhau. Một số hệ thống POS hiện đại tích hợp AI và Machine Learning để cung cấp các phân tích dự đoán và đề xuất sản phẩm. Hệ thống POS hiện đại hỗ trợ bán hàng đa kênh, tích hợp giữa cửa hàng vật lý, website, và các kênh bán hàng khác.

Trong dự án OCHA POS System, chúng ta tập trung vào việc xây dựng một hệ thống POS hiện đại, web-based, với các tính năng real-time synchronization, quản lý kho hàng tự động, và hệ thống tích điểm khách hàng, phù hợp với nhu cầu của các quán cà phê và nhà hàng tại Việt Nam.
