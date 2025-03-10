-- CreateTable
CREATE TABLE "Capacity" (
    "id" SERIAL NOT NULL,
    "value" INTEGER NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Capacity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cabin" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "idCapacity" INTEGER NOT NULL,

    CONSTRAINT "Cabin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id" SERIAL NOT NULL,
    "clientName" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "visitorQuantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CabinReservation" (
    "id" SERIAL NOT NULL,
    "dateIn" TIMESTAMP(3) NOT NULL,
    "dateOut" TIMESTAMP(3) NOT NULL,
    "idCabin" INTEGER NOT NULL,
    "idReservation" INTEGER NOT NULL,

    CONSTRAINT "CabinReservation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CabinReservation_idCabin_dateIn_dateOut_key" ON "CabinReservation"("idCabin", "dateIn", "dateOut");

-- AddForeignKey
ALTER TABLE "Cabin" ADD CONSTRAINT "Cabin_idCapacity_fkey" FOREIGN KEY ("idCapacity") REFERENCES "Capacity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CabinReservation" ADD CONSTRAINT "CabinReservation_idCabin_fkey" FOREIGN KEY ("idCabin") REFERENCES "Cabin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CabinReservation" ADD CONSTRAINT "CabinReservation_idReservation_fkey" FOREIGN KEY ("idReservation") REFERENCES "Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
