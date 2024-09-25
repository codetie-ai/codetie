import Inject
import SwiftUI

struct ContentView: View {
    var body: some View {
        VStack {
            Image(systemName: "swift")
                .resizable()
                .aspectRatio(contentMode: .fit)
                .frame(width: 100, height: 100)
                .foregroundColor(.orange)

            Text("Hello, World!")
                .font(.largeTitle)
                .fontWeight(.bold)
                .padding()
        }
        .enableInjection()
    }
    @ObserveInjection var redraw
}

#Preview {
    ContentView()
}
