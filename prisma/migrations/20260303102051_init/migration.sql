-- CreateTable
CREATE TABLE "Estimate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectName" TEXT NOT NULL DEFAULT 'Jauns projekts',
    "clientName" TEXT,
    "clientCompany" TEXT,
    "clientPhone" TEXT,
    "clientEmail" TEXT,
    "companyName" TEXT,
    "companyRegNr" TEXT,
    "offerValidDays" INTEGER NOT NULL DEFAULT 30,
    "advancePercent" REAL,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "estimateId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Jauns darbs',
    "description" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "jobType" TEXT NOT NULL DEFAULT 'full',
    "productionDiscount" REAL NOT NULL DEFAULT 0,
    "deliveryDiscount" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Job_estimateId_fkey" FOREIGN KEY ("estimateId") REFERENCES "Estimate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MaterialItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "name" TEXT NOT NULL DEFAULT '',
    "notes" TEXT,
    "partType" TEXT NOT NULL DEFAULT 'flat',
    "width" REAL,
    "length" REAL,
    "sideB" REAL,
    "thickness" REAL,
    "outerDiam" REAL,
    "pcsPerUnit" REAL NOT NULL DEFAULT 1,
    "materialKey" TEXT NOT NULL DEFAULT 'steel',
    "unit" TEXT NOT NULL DEFAULT 'm2',
    "pricePerUnit" REAL NOT NULL DEFAULT 0,
    "wasteMarkup" REAL NOT NULL DEFAULT 0.10,
    "weldingLength" REAL NOT NULL DEFAULT 0,
    "weldingHours" REAL NOT NULL DEFAULT 0,
    "grindingHours" REAL NOT NULL DEFAULT 0,
    "strainingHours" REAL NOT NULL DEFAULT 0,
    "rollingHours" REAL NOT NULL DEFAULT 0,
    "drillingHours" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "MaterialItem_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CostLine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "section" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "lineKey" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "quantity" REAL NOT NULL DEFAULT 0,
    "rate" REAL NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL DEFAULT 'st',
    "autoLinked" BOOLEAN NOT NULL DEFAULT false,
    "isCorrection" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "CostLine_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MetalDensity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "nameLv" TEXT NOT NULL,
    "density" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "DefaultRate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lineKey" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "rate" REAL NOT NULL,
    "unit" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "Job_estimateId_idx" ON "Job"("estimateId");

-- CreateIndex
CREATE INDEX "MaterialItem_jobId_idx" ON "MaterialItem"("jobId");

-- CreateIndex
CREATE INDEX "CostLine_jobId_idx" ON "CostLine"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "MetalDensity_name_key" ON "MetalDensity"("name");

-- CreateIndex
CREATE UNIQUE INDEX "DefaultRate_lineKey_key" ON "DefaultRate"("lineKey");
