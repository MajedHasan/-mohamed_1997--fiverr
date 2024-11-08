import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

export async function GET() {
  try {
    const recordsRef = collection(db, "records");
    const snapshot = await getDocs(recordsRef);
    const records = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(records);
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching records" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const docRef = await addDoc(collection(db, "records"), {
      ...data,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      id: docRef.id,
      ...data,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Error creating record" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { id, ...data } = await request.json();
    const docRef = doc(db, "records", id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      id,
      ...data,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Error updating record" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await deleteDoc(doc(db, "records", id));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Error deleting record" },
      { status: 500 }
    );
  }
}
