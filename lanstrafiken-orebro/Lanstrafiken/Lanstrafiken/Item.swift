//
//  Item.swift
//  Lanstrafiken
//
//  Created by Mattias Lind on 2026-07-06.
//

import Foundation
import SwiftData

@Model
final class Item {
    var timestamp: Date
    
    init(timestamp: Date) {
        self.timestamp = timestamp
    }
}
