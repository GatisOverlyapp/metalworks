-- CreateTable
CREATE TABLE "Estimate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "projectName" TEXT NOT NULL DEFAULT '',
    "clientName" TEXT NOT NULL DEFAULT '',
    "clientEmail" TEXT NOT NULL DEFAULT '',
    "clientPhone" TEXT NOT NULL DEFAULT '',
    "clientAddr" TEXT NOT NULL DEFAULT '',
    "companyName" TEXT NOT NULL DEFAULT '',
    "companyReg" TEXT NOT NULL DEFAULT '',
    "companyAddr" TEXT NOT NULL DEFAULT '',
    "companyPhone" TEXT NOT NULL DEFAULT '',
    "companyEmail" TEXT NOT NULL DEFAULT '',
    "companyBank" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "discount" REAL NOT NULL DEFAULT 0,
    "vatRate" REAL NOT NULL DEFAULT 21,
    "notes" TEXT NOT NULL DEFAULT '',
    "totalMaterialsCost" REAL NOT NULL DEFAULT 0,
    "totalProductionCost" REAL NOT NULL DEFAULT 0,
    "totalDeliveryCost" REAL NOT NULL DEFAULT 0,
    "totalBeforeDiscount" REAL NOT NULL DEFAULT 0,
    "totalDiscount" REAL NOT NULL DEFAULT 0,
    "totalBeforeVat" REAL NOT NULL DEFAULT 0,
    "totalVat" REAL NOT NULL DEFAULT 0,
    "totalWithVat" REAL NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "FlatSheetPart" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "estimateId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "name" TEXT NOT NULL DEFAULT '',
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "width" REAL NOT NULL DEFAULT 0,
    "length" REAL NOT NULL DEFAULT 0,
    "thickness" REAL NOT NULL DEFAULT 0,
    "material" TEXT NOT NULL DEFAULT 'S235',
    "density" REAL NOT NULL DEFAULT 7850,
    "pricePerKg" REAL NOT NULL DEFAULT 0,
    "weldMeters" REAL NOT NULL DEFAULT 0,
    "surfaceArea" REAL NOT NULL DEFAULT 0,
    "totalKg" REAL NOT NULL DEFAULT 0,
    "totalCost" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "FlatSheetPart_estimateId_fkey" FOREIGN KEY ("estimateId") REFERENCES "Estimate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TubeProfilePart" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "estimateId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "name" TEXT NOT NULL DEFAULT '',
    "profileType" TEXT NOT NULL DEFAULT 'shs',
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "lengthMm" REAL NOT NULL DEFAULT 0,
    "dimA" REAL NOT NULL DEFAULT 0,
    "dimB" REAL NOT NULL DEFAULT 0,
    "thickness" REAL NOT NULL DEFAULT 0,
    "material" TEXT NOT NULL DEFAULT 'S235',
    "density" REAL NOT NULL DEFAULT 7850,
    "pricePerKg" REAL NOT NULL DEFAULT 0,
    "weldMeters" REAL NOT NULL DEFAULT 0,
    "totalLengthM" REAL NOT NULL DEFAULT 0,
    "orderLengthM" REAL NOT NULL DEFAULT 0,
    "kgPerM" REAL NOT NULL DEFAULT 0,
    "totalKg" REAL NOT NULL DEFAULT 0,
    "totalCost" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "TubeProfilePart_estimateId_fkey" FOREIGN KEY ("estimateId") REFERENCES "Estimate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuxiliaryItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "estimateId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "name" TEXT NOT NULL DEFAULT '',
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit" TEXT NOT NULL DEFAULT 'gab.',
    "unitPrice" REAL NOT NULL DEFAULT 0,
    "totalCost" REAL NOT NULL DEFAULT 0,
    "notes" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "AuxiliaryItem_estimateId_fkey" FOREIGN KEY ("estimateId") REFERENCES "Estimate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProductionLine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "estimateId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "category" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL DEFAULT '',
    "unit" TEXT NOT NULL DEFAULT 'h',
    "quantity" REAL NOT NULL DEFAULT 0,
    "unitPrice" REAL NOT NULL DEFAULT 0,
    "totalCost" REAL NOT NULL DEFAULT 0,
    "isAutoLinked" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "ProductionLine_estimateId_fkey" FOREIGN KEY ("estimateId") REFERENCES "Estimate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DeliveryLine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "estimateId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "category" TEXT NOT NULL DEFAULT '',
    "name" TEXT NOT NULL DEFAULT '',
    "unit" TEXT NOT NULL DEFAULT 'h',
    "quantity" REAL NOT NULL DEFAULT 0,
    "unitPrice" REAL NOT NULL DEFAULT 0,
    "totalCost" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "DeliveryLine_estimateId_fkey" FOREIGN KEY ("estimateId") REFERENCES "Estimate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProposalLine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "estimateId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "name" TEXT NOT NULL DEFAULT '',
    "unit" TEXT NOT NULL DEFAULT 'kompl.',
    "quantity" REAL NOT NULL DEFAULT 1,
    "unitPrice" REAL NOT NULL DEFAULT 0,
    "totalCost" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "ProposalLine_estimateId_fkey" FOREIGN KEY ("estimateId") REFERENCES "Estimate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MetalDensity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "material" TEXT NOT NULL,
    "density" REAL NOT NULL,
    "label" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "HourlyRate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "category" TEXT NOT NULL,
    "rate" REAL NOT NULL,
    "label" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "TransportRate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "rate" REAL NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'km',
    "label" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "FlatSheetPart_estimateId_idx" ON "FlatSheetPart"("estimateId");

-- CreateIndex
CREATE INDEX "TubeProfilePart_estimateId_idx" ON "TubeProfilePart"("estimateId");

-- CreateIndex
CREATE INDEX "AuxiliaryItem_estimateId_idx" ON "AuxiliaryItem"("estimateId");

-- CreateIndex
CREATE INDEX "ProductionLine_estimateId_idx" ON "ProductionLine"("estimateId");

-- CreateIndex
CREATE INDEX "DeliveryLine_estimateId_idx" ON "DeliveryLine"("estimateId");

-- CreateIndex
CREATE INDEX "ProposalLine_estimateId_idx" ON "ProposalLine"("estimateId");

-- CreateIndex
CREATE UNIQUE INDEX "MetalDensity_material_key" ON "MetalDensity"("material");

-- CreateIndex
CREATE UNIQUE INDEX "HourlyRate_category_key" ON "HourlyRate"("category");

-- CreateIndex
CREATE UNIQUE INDEX "TransportRate_name_key" ON "TransportRate"("name");
